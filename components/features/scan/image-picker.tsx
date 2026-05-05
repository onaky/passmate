"use client";

import { useRef, useState } from "react";
import { Camera, ImageIcon, FileImage } from "lucide-react";
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
      <button
        onClick={() => cameraRef.current?.click()}
        className="w-full py-5 rounded-2xl bg-indigo-500 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform"
      >
        <Camera size={24} />
        카메라로 촬영하기
      </button>

      <button
        onClick={() => fileRef.current?.click()}
        className="w-full py-4 rounded-2xl bg-[var(--secondary)] text-[var(--foreground)] font-semibold flex items-center justify-center gap-3 active:scale-95 transition-transform"
      >
        <ImageIcon size={20} />
        갤러리에서 선택
      </button>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center transition-colors
          ${dragging ? "border-indigo-400 bg-indigo-500/10" : "border-[var(--border)] bg-[var(--card)]"}
        `}
      >
        <FileImage size={32} className="mx-auto mb-2 text-[var(--muted-foreground)]" />
        <p className="text-sm text-[var(--muted-foreground)]">
          여기에 이미지를 드래그하거나<br />
          붙여넣기 하세요
        </p>
      </div>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
    </div>
  );
}
