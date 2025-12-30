import { useState } from 'react'
import type { DocumentItem, ChatMessage } from './types'
import { uploadDocument, sendChatMessage } from './api'
import { Layout } from './components/Layout';
import { UploadArea } from './components/UploadArea';
import { DocumentList } from './components/DocumentList';
import { ChatMessages } from './components/ChatMessages';
import { ChatInput } from './components/ChatInput';


function createUserMessage(content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: 'user',
    content,
    createdAt: new Date().toISOString(),
  };
}

function App() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  //UI states
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleUploadChange(event:React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setError(null);

      const doc = await uploadDocument(file);

      // Add the new document to the list
      setDocuments((prev) => [...prev, doc]);

      // If no document was selected before, select this one
      setSelectedDocId((prev) => prev ?? doc.id);
    } catch(e) {
      console.error(e);
      setError("Failed to upload document");
    } finally {
      setIsUploading(false);
      // Allow selecting the same file again if needed
      event.target.value = '';
    }
  }

  const selectedDocument = selectedDocId
    ? documents.find((doc) => doc.id === selectedDocId) ?? null
    : null;

  async function handleSend() {
    if(!selectedDocId) {
      setError("Please select a document first");
      return;
    }
    const text = inputValue.trim();
    if(!text) return;

    // Clear the input and any previous error
    setInputValue('');
    setError(null);

    // Build the user message
    const userMessage = createUserMessage(text);

    // Optimistically show the user message in the chat
    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);
    try {
      const assistantMessage = await sendChatMessage({
        documentId: selectedDocId,
        messages: [...messages, userMessage],
        newMessage: text,
      });
      setMessages((prev) => [...prev, assistantMessage]);
    } catch(e) {
      console.error(e);
      setError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Layout
      sidebar={
        <div className="flex h-full flex-col gap-6">
          <div>
            <p className="text-[16px] uppercase tracking-[0.2em] text-slate-400">
              AI Knowledge Sidekick
            </p>
            <h1 className="m-0 text-[16px] font-semibold text-slate-200">
              Upload a PDF or text file and ask grounded questions about it.
            </h1>
          </div>
          <UploadArea
            onUploadChange={handleUploadChange}
            isUploading={isUploading}
          />
          <div className="mt-[30px] border-t border-[#1e2b46] pt-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Documents
            </p>
            <DocumentList
              documents={documents}
              selectedDocId={selectedDocId}
              onSelect={setSelectedDocId}
            />
          </div>
        </div>
      }
      main={
        <div className="flex h-full flex-col">
          <header className="border-b border-[#1d2740] bg-[#101a31] px-6 py-6">
            <div className="mx-auto w-full max-w-4xl">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
                AI Knowledge Sidekick
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white">
                {selectedDocument
                  ? selectedDocument.name
                  : 'No document selected'}
              </h2>
              <p className="text-sm text-slate-200">
                Answers are based only on the content of the selected document.
              </p>
            </div>
          </header>

          <ChatMessages messages={messages} isLoading={isSending} />

          {error && (
            <div className="px-6 pb-2 text-sm text-red-300">{error}</div>
          )}

          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            disabled={!selectedDocId || isSending}
            placeholder={
              selectedDocument
                ? 'Ask a question about this document…'
                : 'Upload & select a document to start chatting…'
            }
          />
        </div>
      }
    />
  );
}

export default App;
