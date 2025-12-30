//Data model

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
    id: string;
    role: ChatRole;
    content: string;
    createdAt: string;
    citations?: string[];
}

export interface DocumentItem {
    id: string;
    name: string;
    size: number;
    uploadedAt: string;
}