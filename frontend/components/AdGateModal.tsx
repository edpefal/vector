"use client";

/**
 * AdGateModal - Gate SVG downloads behind a Google AdSense video ad
 *
 * Flow:
 * 1. Modal opens when user clicks "Download SVG"
 * 2. User clicks "Watch Ad" to proceed
 * 3. Google IMA SDK loads and plays non-skippable video ad
 * 4. On ad completion callback, triggers onAdComplete callback
 * 5. Parent component handles automatic file download
 * 6. Modal closes
 *
 * Fallback:
 * - If ad doesn't complete within 60 seconds, shows manual "Download Now" button
 * - User can click to proceed anyway (still counted as ad view attempt)
 */

import { useEffect, useRef, useState } from "react";
import { playAd } from "@/lib/adsense";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdComplete: () => void;
}

export function AdGateModal({ isOpen, onClose, onAdComplete }: Props) {
  const [stage, setStage] = useState<"initial" | "playing" | "fallback">("initial");
  const [error, setError] = useState<string | null>(null);
  const [timeoutFallback, setTimeoutFallback] = useState(false);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const adCompleteRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      // Cleanup when modal closes
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setStage("initial");
      setError(null);
      setTimeoutFallback(false);
      adCompleteRef.current = false;
      return;
    }
  }, [isOpen]);

  const handleWatchAd = async () => {
    const mode = process.env.NEXT_PUBLIC_ADSENSE_MODE || "test";
    console.log(`Starting ad watch in ${mode} mode`);

    setStage("playing");
    setError(null);
    setTimeoutFallback(false);
    adCompleteRef.current = false;

    // Set 60-second fallback timeout (show manual download button)
    timeoutRef.current = setTimeout(() => {
      console.warn("Ad did not complete within 60 seconds, showing fallback");
      setTimeoutFallback(true);
    }, 60000);

    // Wait for React to render the container before trying to access it
    setTimeout(async () => {
      try {
        await playAd("ad-container", {
          onAdStart: () => {
            console.log("Ad started");
          },
          onAdComplete: () => {
            console.log("Ad completed successfully");
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            adCompleteRef.current = true;
            // Auto-download after ad completes
            setTimeout(() => {
              onAdComplete();
            }, 500);
          },
          onAdError: (error: string) => {
            console.error("Ad error:", error);
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            // Improve error messages
            let friendlyMessage = error;
            if (error.includes("not available") || error.includes("ad blocker")) {
              friendlyMessage = "AdSense is blocked. Please disable your ad blocker.";
            } else if (error.includes("Container not found")) {
              friendlyMessage = "Ad player failed to initialize. Try refreshing the page.";
            } else if (error.includes("not configured")) {
              friendlyMessage = "Ad unit is not configured. Contact support.";
            }
            setError(friendlyMessage);
            setStage("initial");
          },
          onAdSkip: (skipReason?: string) => {
            console.log("Ad skipped");
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            setError(skipReason || "Ad was skipped. Please watch the full ad to download.");
            setStage("initial");
          },
        });
      } catch (err) {
        console.error("Error loading ad:", err);
        setError(err instanceof Error ? err.message : "Failed to load ad");
        setStage("initial");
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    }, 100); // Give React time to render the container
  };

  const handleFallbackDownload = () => {
    // Manual download button (appears if ad takes >60 seconds)
    if (adCompleteRef.current) {
      onAdComplete();
    } else {
      setError("Ad not fully completed. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-lg sm:mx-0">
        {/* Initial State: Ask to watch ad */}
        {stage === "initial" && (
          <>
            <h2 className="mb-2 text-lg font-bold text-gray-900">
              Watch an Ad to Download
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Support our free service by watching a short video ad. It takes less than a minute!
            </p>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleWatchAd}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:scale-95 transition-transform"
              >
                Watch Ad
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-transform"
              >
                No, thanks
              </button>
            </div>
          </>
        )}

        {/* Playing State: Show ad container */}
        {stage === "playing" && (
          <>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              Playing Ad...
            </h2>
            <div
              ref={adContainerRef}
              id="ad-container"
              className="mb-4 min-h-64 rounded-lg bg-gray-100"
            />

            {timeoutFallback && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-gray-600">
                  The ad is taking longer than expected. You can download now, or wait for it to complete.
                </p>
                <button
                  onClick={handleFallbackDownload}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 active:scale-95 transition-transform"
                >
                  Download Now
                </button>
              </div>
            )}
          </>
        )}

        {/* Error State: Show error message (embedded in initial state above) */}
      </div>
    </div>
  );
}
