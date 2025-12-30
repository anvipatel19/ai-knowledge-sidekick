import type { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`w-full ${isUser ? 'text-right' : 'text-left'}`}>
      <div
        className={`w-full rounded-xl border px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'border-[#1d8bf2]/60 bg-[#153867] text-white'
            : 'border-[#1c2b45] bg-[#101d36] text-slate-100'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
