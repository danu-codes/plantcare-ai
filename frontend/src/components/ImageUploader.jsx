
import { useRef, useState } from "react";
import {
  UploadCloud,
  ImagePlus,
  Trash2,
  ScanLine,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import { validateImage } from "../services/api";

export default function ImageUploader({
  selectedFile,
  preview,
  onSelect,
  onRemove,
  onAnalyze,
  loading,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function handleFile(file) {
    const message = validateImage(file);

    if (message) {
      setError(message);
      return;
    }

    setError("");
    onSelect(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) handleFile(file);
  }

  return (
    <div className="rounded-[28px] border border-[#e1ece0] bg-white p-5 shadow-xl shadow-green-950/5 sm:p-7">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
          <ImagePlus size={23} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#173f2b]">
            Upload a leaf image
          </h2>
          <p className="mt-1 text-sm text-[#718678]">
            Add a clear photo of the plant leaf.
          </p>
        </div>
      </div>

      {preview ? (
        <div className="relative overflow-hidden rounded-2xl bg-[#f4f8f3]">
          <img
            src={preview}
            alt="Selected plant leaf"
            className="h-64 w-full object-contain sm:h-80"
          />

          <button
            type="button"
            onClick={onRemove}
            disabled={loading}
            aria-label="Remove selected image"
            className="absolute right-3 top-3 rounded-xl bg-white p-2.5 text-red-600 shadow-md hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 size={19} />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragging(false);
          }}
          onDrop={handleDrop}
          className={`flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 text-center transition ${
            dragging
              ? "border-green-600 bg-green-100"
              : "border-[#b9d9bf] bg-[#f8fbf7] hover:border-green-500 hover:bg-green-50"
          }`}
        >
          <div className="mb-4 rounded-2xl bg-[#e3f2e5] p-4 text-[#21884e]">
            <UploadCloud size={35} strokeWidth={1.7} />
          </div>

          <h3 className="text-lg font-bold text-[#214d35]">
            Drag & drop your image here
          </h3>

          <p className="mt-2 text-sm text-[#78907d]">
            Or click to browse your files
          </p>

          <span className="mt-5 rounded-full border border-green-200 bg-white px-5 py-2 text-sm font-semibold text-green-700">
            Browse images
          </span>

          <p className="mt-5 text-xs text-[#8ba091]">
            JPG, PNG, WebP · Maximum 5 MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFile(file);
          event.target.value = "";
        }}
      />

      {selectedFile && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#f6f9f4] px-4 py-3">
          <span className="min-w-0 truncate text-sm font-medium text-[#355d43]">
            {selectedFile.name}
          </span>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="shrink-0 text-sm font-semibold text-green-700 hover:underline disabled:opacity-50"
          >
            Change
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle size={17} className="shrink-0" />
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={onAnalyze}
        disabled={!selectedFile || loading}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#176a43] px-6 py-4 font-semibold text-white shadow-lg shadow-green-900/10 transition hover:bg-[#105135] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <LoaderCircle className="animate-spin" size={21} />
            Analyzing your plant...
          </>
        ) : (
          <>
            <ScanLine size={21} />
            Analyze Plant Health
          </>
        )}
      </button>

      <p className="mt-4 text-center text-xs leading-5 text-[#8a9b8e]">
        AI classifications are estimates and are not confirmed
        plant disease diagnoses.
      </p>
    </div>
  );
}
