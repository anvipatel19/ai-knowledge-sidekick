import type { DocumentItem } from '../types';

interface DocumentListProps {
  documents: DocumentItem[];
  selectedDocId: string | null;
  onSelect: (id: string) => void;
}

export function DocumentList({
  documents,
  selectedDocId,
  onSelect,
}: DocumentListProps) {
  if (!documents.length) {
    return (
      <p className="mt-2 text-sm italic text-slate-200">
        No documents yet. Upload one to get started.
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-2 border border-[#1e2b46] bg-[#0b152b] px-2 py-2">
      {documents.map((doc) => {
        const isActive = doc.id === selectedDocId;
        return (
          <button
            key={doc.id}
            type="button"
            onClick={() => onSelect(doc.id)}
            className={`w-full rounded-lg px-3 py-2 text-left transition ${
              isActive
                ? 'bg-[#142850] text-white'
                : 'text-slate-100 hover:bg-[#101d3a]'
            }`}
          >
            <p
              className="truncate text-sm font-medium"
              style={{ color: '#f8fbff' }}
            >
              {doc.name}
            </p>
            <p className="text-xs text-slate-300">
              {(doc.size / 1024).toFixed(1)} KB
            </p>
          </button>
        );
      })}
    </div>
  );
}
