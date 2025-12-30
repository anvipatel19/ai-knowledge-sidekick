import type { KeyboardEvent } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  placeholder,
}: ChatInputProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  }

  return (
    <div className="border-t border-[#1d2740] bg-[#0b1424] px-6 py-4">
      <div className="mx-auto flex w-full max-w-4xl items-center gap-3 rounded-2xl border border-[#273550] bg-[#111c34] px-5 py-4">
        <textarea
          className="flex-1 resize-none border-0 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          rows={3}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="inline-flex h-[40px] min-w-[120px] items-center justify-center gap-2 rounded-[10px] bg-[#0c8ae8] px-6 text-sm font-semibold text-white transition enabled:hover:bg-[#1396fb] disabled:opacity-40"
        >
          Send
        </button>
      </div>
      <div className="mt-2 text-center text-[11px] text-slate-500">
        Enter to send · Shift+Enter for newline
      </div>
    </div>
  );
}
