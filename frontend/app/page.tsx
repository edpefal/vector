"use client";

import { useState } from "react";
import { UploadZone } from "@/components/UploadZone";
import { ResultPanel } from "@/components/ResultPanel";
import { Spinner } from "@/components/Spinner";
import { AdGateModal } from "@/components/AdGateModal";

type AppState =
  | { phase: "idle" }
  | { phase: "processing"; preview: string }
  | { phase: "done"; preview: string; svgContent: string; originalName: string }
  | { phase: "ad-gate"; preview: string; svgContent: string; originalName: string }
  | { phase: "error"; preview: string; message: string };

export default function HomePage() {
  const [state, setState] = useState<AppState>({ phase: "idle" });

  const handleFile = async (file: File) => {
    const preview = URL.createObjectURL(file);
    setState({ phase: "processing", preview });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120_000);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vectorize`,
        { method: "POST", body: formData, signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail ?? "Unknown error");
      }
      const svgContent = await res.text();
      setState({
        phase: "done",
        preview,
        svgContent,
        originalName: file.name.replace(/\.[^.]+$/, ""),
      });

      // Log vectorization success
      logEvent("vectorization", {
        filename: file.name,
        size_bytes: file.size,
        status: "success",
      });
    } catch (e: unknown) {
      const message =
        e instanceof DOMException && e.name === "AbortError"
          ? "Request timed out. Try a smaller image."
          : e instanceof Error
          ? e.message
          : "Upload failed";
      setState({ phase: "error", preview, message });

      // Log vectorization failure
      logEvent("vectorization", {
        filename: file.name,
        error: message,
        status: "failure",
      });
    }
  };

  const handleDownloadClick = () => {
    // User clicked Download → show ad gate modal
    if (state.phase === "done") {
      logEvent("download_attempt", {});
      setState({
        phase: "ad-gate",
        preview: state.preview,
        svgContent: state.svgContent,
        originalName: state.originalName,
      });
    }
  };

  const handleAdComplete = () => {
    // Ad completed → trigger download
    if (state.phase === "ad-gate") {
      logEvent("ad_complete", {});
      // Download file
      downloadSvg(state.svgContent, state.originalName);
      // Return to done state (modal closes)
      setState({
        phase: "done",
        preview: state.preview,
        svgContent: state.svgContent,
        originalName: state.originalName,
      });
    }
  };

  const handleAdReject = () => {
    // User rejected ad → return to done without downloading
    if (state.phase === "ad-gate") {
      logEvent("ad_reject", {});
      setState({
        phase: "done",
        preview: state.preview,
        svgContent: state.svgContent,
        originalName: state.originalName,
      });
    }
  };

  const handleReset = () => setState({ phase: "idle" });

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Image Vectorizer
        </h1>
        <p className="mt-2 text-gray-500">
          Upload a PNG or JPEG and get a clean, scalable SVG
        </p>
      </header>

      {state.phase === "idle" && <UploadZone onFile={handleFile} />}

      {state.phase === "processing" && (
        <div className="flex flex-col items-center gap-8">
          <img
            src={state.preview}
            alt="Original"
            className="max-h-72 rounded-lg shadow"
          />
          <Spinner label="Vectorizing your image…" />
        </div>
      )}

      {state.phase === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-700">Something went wrong</p>
          <p className="mt-1 text-sm text-red-600">{state.message}</p>
          <button
            onClick={handleReset}
            className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}

      {(state.phase === "done" || state.phase === "ad-gate") && (
        <>
          <ResultPanel
            preview={state.preview}
            svgContent={state.svgContent}
            originalName={state.originalName}
            onReset={handleReset}
            onDownloadClick={handleDownloadClick}
          />
          <AdGateModal
            isOpen={state.phase === "ad-gate"}
            onClose={handleAdReject}
            onAdComplete={handleAdComplete}
            originalName={state.originalName}
          />
        </>
      )}
    </main>
  );
}

/**
 * Download SVG file to browser
 */
function downloadSvg(svgContent: string, originalName: string): void {
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${originalName}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Log event to server for analytics
 */
function logEvent(eventType: string, data: Record<string, string | number | boolean | null>): void {
  // Log to console
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({ timestamp, event: eventType, ...data }));

  // Also send to backend
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: eventType, ...data }),
  }).catch((err) => {
    console.error("Failed to log event to backend:", err);
  });
}
