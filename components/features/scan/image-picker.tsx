"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/utils";

interface ImagePickerProps {
  onImage: (base64: string) => void;
}

export function ImagePicker({ onImage }: ImagePickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    try {
      const compressed = await compressImage(file, 1024, 0.8);
      onImage(compressed);
    } catch {
      // fallback: use FileReader directly
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) onImage(e.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 카메라 촬영 */}
      <button
        onClick={() => cameraRef.current?.click()}
        className="w-full py-5 rounded-2xl bg-indigo-500 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform"
      >
        <span className="text-2xl">📷</span>
        카메라로 촬영하기
      </button>

      {/* 갤러리에서 선택 */}
      <button
        onClick={() => fileRef.current?.click()}
        className="w-full py-4 rounded-2xl bg-[var(--secondary)] text-[var(--foreground)] font-semibold flex items-center justify-center gap-3 active:scale-95 transition-transform"
      >
        <span className="text-xl">🖼️</span>
        갤러리에서 선택
      </button>

      {/* 드래그 앤 드롭 영역 */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center transition-colors
          ${dragging
            ? "border-indigo-400 bg-indigo-500/10"
            : "border-[var(--border)] bg-[var(--card)]"
          }
        `}
      >
        <div className="text-3xl mb-2">📄</div>
        <p className="text-sm text-[var(--muted-foreground)]">
          여기에 이미지를 드래그하거나<br />
          붙여넣기 하세요
        </p>
      </div>

      {/* 숨김 input */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
