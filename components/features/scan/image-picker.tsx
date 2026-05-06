"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, ImageIcon, FileImage, X, Plus } from "lucide-react";
import { compressImage } from "@/lib/utils";

interface ImagePickerProps {
  onImages: (base64List: string[]) => void;
}

export function ImagePicker({ onImages }: ImagePickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  async function compressToBase64(file: File): Promise<string> {
    try {
      return await compressImage(file, 1024, 0.8);
    } catch {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }
  }

  async function addFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    const compressed = await Promise.all(imageFiles.map(compressToBase64));
    setPreviews((prev) => [...prev, ...compressed].slice(0, 5));
  }

  function removePreview(index: number) {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 미리보기 그리드 */}
      {previews.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[var(--secondary)] border border-[var(--border)]">
                <Image src={src} alt={`이미지 ${i + 1}`} fill className="object-cover" />
                <button
                  onClick={() => removePreview(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {previews.length < 5 && (
              <button
                onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-1 text-[var(--muted-foreground)] hover:border-indigo-400 transition-colors"
              >
                <Plus size={20} />
                <span className="text-[10px]">추가</span>
              </button>
            )}
          </div>

          <button
            onClick={() => onImages(previews)}
            className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform"
          >
            AI 분석 시작 ({previews.length}장)
          </button>

          {previews.length < 5 && (
            <div className="flex gap-2">
              <button
                onClick={() => cameraRef.current?.click()}
                className="flex-1 py-3 rounded-2xl bg-[var(--secondary)] text-[var(--foreground)] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm"
              >
                <Camera size={16} /> 촬영 추가
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex-1 py-3 rounded-2xl bg-[var(--secondary)] text-[var(--foreground)] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm"
              >
                <ImageIcon size={16} /> 갤러리 추가
              </button>
            </div>
          )}
        </>
      )}

      {/* 초기 상태 */}
      {previews.length === 0 && (
        <>
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
            갤러리에서 선택 (최대 5장)
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
              붙여넣기 하세요 (최대 5장)
            </p>
          </div>
        </>
      )}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
      />
    </div>
  );
}
