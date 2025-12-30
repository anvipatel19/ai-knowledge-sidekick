import type { ChangeEvent } from 'react';

interface UploadAreaProps {
  onUploadChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export function UploadArea({ onUploadChange, isUploading }: UploadAreaProps) {
  return (
    <div className="rounded-[28px] border border-dashed border-[#3e4c66] bg-[#101a2f] p-[20px] text-sm shadow-inner shadow-black/40">
      <span className="mb-[10px] block text-base font-semibold text-white leading-tight">
        Upload document
      </span>
      <span className="mt-1 block text-[14px] text-slate-400 mb-[15px]">
        Supports .txt and .pdf files
      </span>
      <label className="mt-4 inline-flex h-[40px] w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#0c8ae8] px-5 text-sm font-semibold text-white transition hover:bg-[#1396fb] disabled:opacity-60">
        <input
          type="file"
          accept=".txt,.pdf"
          onChange={onUploadChange}
          disabled={isUploading}
          className="hidden"
        />
        <span className="text-base">⬆️</span>
        {isUploading ? 'Uploading…' : 'Choose file'}
      </label>
    </div>
  );
}
