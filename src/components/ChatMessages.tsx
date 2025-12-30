import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { MessageBubble } from './MessageBubble';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#0f1d36] px-6 py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        {!messages.length && !isLoading && (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-[#2f3d58] bg-[#111b2f] px-8 py-16 text-center text-sm text-slate-300">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a2842] text-2xl text-slate-200">
              ✨
            </div>
            <p className="text-base font-semibold text-white">
              No document selected
            </p>
            <p className="mt-2 max-w-sm">
              Upload and select a document from the sidebar to start asking
              questions.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {isLoading && (
          <div className="text-center text-xs text-slate-400">
            Assistant is thinking…
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
