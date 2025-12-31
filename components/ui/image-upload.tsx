"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  onRemove: (index: number) => void;
  maxFiles?: number;
}

export const ImageUpload = ({
  value,
  onChange,
  onRemove,
  maxFiles = 5,
}: ImageUploadProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onChange([...value, ...acceptedFiles]);
    },
    [onChange, value]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: maxFiles - value.length,
    disabled: value.length >= maxFiles,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200
          ${
            isDragActive
              ? "border-black bg-zinc-50 scale-[0.99]"
              : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50/50"
          }
          ${value.length >= maxFiles ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div className="p-3 rounded-full bg-zinc-100 mb-3">
          <UploadCloud className="w-6 h-6 text-zinc-500" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-700">
            {isDragActive
              ? "Suelta los archivos aquí"
              : "Click o arrastra imágenes"}
          </p>
          <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide">
            JPG, PNG, WEBP (Máx 4MB)
          </p>
        </div>
      </div>

      {/* Previsualización Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {value.map((file, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200 group bg-white"
            >
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-700"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
