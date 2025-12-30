import type { DocumentItem, ChatMessage } from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

export async function uploadDocument(file:File): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const text = await res.text();
        console.error('Upload failed:', res.status, text); // extra logging
        throw new Error('Failed to upload document');
    }

    // Response should be JSON like:
    // { id: string, name: string, size: number, uploadedAt: string }
    const data = await res.json();
    return {
        id: data.id,
        name: data.name,
        size: data.size,
        uploadedAt: data.uploadedAt,
    };
}

interface SendChatParams {
    documentId: string;
    messages: ChatMessage[];
    newMessage: string;
}

export async function sendChatMessage(params:SendChatParams): Promise<ChatMessage> {
    const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });

    if (!res.ok) {
        const text = await res.text();
        console.error('Chat failed:', res.status, text);
        throw new Error('Failed to send chat message');
    }

    const data = await res.json();

    const assistantMessage: ChatMessage = {
        id: data.id,
        role: 'assistant',
        content: data.content,
        createdAt: data.createdAt,
        citations: data.citations,
    };

    return assistantMessage;
}
