"use client";

import { useRef, useState } from "react";
import { API, imageSrc } from "@/lib/api";

const MAX_SIDE = 1000; // the shop shows small squares, so there is no need to store full camera photos

// Shrinks the chosen photo in the browser and returns a JPEG blob.
async function shrink(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff"; // transparent PNGs would turn black in a JPEG otherwise
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not read that photo"))), "image/jpeg", 0.85)
  );
}

// Either upload a photo or paste a link. `value` is the final image address saved on the product.
export default function ImagePicker({ value, onChange, token }) {
  const isLink = value && !value.startsWith("/api/images/");
  const [mode, setMode] = useState(isLink ? "link" : "upload");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    setError("");
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setError("Please choose a JPG, PNG or WebP photo.");
    if (file.size > 15 * 1024 * 1024) return setError("That photo is too large (max 15 MB).");
    setBusy(true);
    try {
      const blob = await shrink(file);
      const res = await fetch(`${API}/admin/images`, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg", Authorization: `Bearer ${token}` },
        body: blob,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Upload failed");
      onChange(data.url);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const tab = (id, label) => (
    <button
      type="button"
      onClick={() => setMode(id)}
      className={`rounded-md px-3 py-1.5 text-sm transition ${
        mode === id ? "bg-ink font-medium text-white" : "text-ink/60 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-medium">
          Product photo <span className="font-normal text-clay">*</span>
        </label>
        <div className="flex gap-1 rounded-md border border-ink/15 bg-white p-0.5">
          {tab("upload", "Upload photo")}
          {tab("link", "Use a link")}
        </div>
      </div>

      <div className="flex items-stretch gap-3">
        {/* Preview */}
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md border border-ink/15 bg-sand">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc(value)}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.opacity = "0.2")}
              onLoad={(e) => (e.currentTarget.style.opacity = "1")}
            />
          ) : (
            <span className="px-2 text-center text-xs text-ink/40">No photo yet</span>
          )}
        </div>

        {mode === "upload" ? (
          <div
            onClick={() => !busy && fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              upload(e.dataTransfer.files?.[0]);
            }}
            className={`flex flex-1 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-3 text-center text-sm transition ${
              drag ? "border-leaf bg-[#f1f7f2]" : "border-ink/20 hover:border-leaf"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => upload(e.target.files?.[0])}
            />
            {busy ? (
              <span className="text-ink/60">Uploading…</span>
            ) : (
              <>
                <span className="font-medium text-leaf">{value ? "Choose a different photo" : "Choose a photo"}</span>
                <span className="mt-1 text-xs text-ink/50">or drop it here. JPG, PNG or WebP</span>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-center">
            <input
              className="input"
              placeholder="https://example.com/photo.jpg"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
            <p className="mt-1 text-xs text-ink/50">Paste the address of a photo that is already online.</p>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-clay">{error}</p>}
    </div>
  );
}
