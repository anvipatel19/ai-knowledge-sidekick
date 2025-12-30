# AI Knowledge Sidekick

AI Knowledge Sidekick is a small full-stack app that lets you upload a document (PDF or plain text) and then chat with it. You pick a document in the sidebar and ask questions; the assistant answers using only the content of that file.

It’s built as a focused front-end project with a Node/Express backend and Hugging Face for the model, so it’s easy to read and easy to demo.

---

## What it does

- Upload **.pdf** or **.txt** files
- See all uploaded documents in a sidebar with basic metadata
- Select a document and ask questions in a chat interface
- Get answers that are grounded in that document’s text
- Falls back to a simple local summarizer if the model API is unavailable

The goal is to show how to structure a front-end driven “chat with your docs” UI without a huge codebase or heavy infrastructure.

---

## Tech stack

**Frontend**

- React + TypeScript
- Vite
- Tailwind CSS

**Backend**

- Node.js + Express
- Multer for file uploads
- PDF parsing (buffer → extracted text)
- Hugging Face Router’s `chat/completions` API for the model

---

## Project structure

ai-knowledge-sidekick/
  src/               # React + TypeScript frontend
    App.tsx
    api.ts
    types.ts
    components/
      Layout.tsx
      UploadArea.tsx
      DocumentList.tsx
      ChatMessages.tsx
      ChatInput.tsx
      MessageBubble.tsx
  server/            # Node/Express backend
    src/server.ts
    package.json
