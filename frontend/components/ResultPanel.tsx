"use client";

interface Props {
  preview: string;
  svgContent: string;
  originalName: string;
  onReset: () => void;
  onDownloadClick: () => void;
}

export function ResultPanel({ preview, svgContent, originalName, onReset, onDownloadClick }: Props) {

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
            Original
          </p>
          <div className="flex items-center justify-center rounded-xl bg-white p-4 shadow-sm">
            <img
              src={preview}
              alt="Original"
              className="max-h-80 w-full object-contain"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
            Vectorized SVG
          </p>
          <div
            className="flex max-h-80 items-center justify-center overflow-hidden rounded-xl bg-white p-4 shadow-sm [&>svg]:max-h-72 [&>svg]:w-full [&>svg]:object-contain"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={onDownloadClick}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-transform"
        >
          Download SVG
        </button>
        <button
          onClick={onReset}
          className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition-transform"
        >
          Vectorize another
        </button>
      </div>
    </div>
  );
}
