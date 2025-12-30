import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse') as {
  PDFParse: new (params: { data: Buffer }) => {
    getText: () => Promise<{ text?: string }>;
    destroy: () => Promise<void>;
  };
};

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ---- Hugging Face config ----
const HF_API_TOKEN = process.env.HF_API_TOKEN;

// Choose a simple instruct/chat model that works with the Router chat-completions API.
// Default to an open Llama 3.1 instruct model that is available through Hugging Face's router.
const HF_MODEL_ID =
  process.env.HF_MODEL_ID ?? 'meta-llama/Llama-3.2-1B-Instruct';

// ---- Helper to call Hugging Face Inference API ----
async function askHuggingFace(prompt: string): Promise<string> {
  if (!HF_API_TOKEN) {
    console.error('Missing HF_API_TOKEN in environment');
    throw new Error('Missing HF_API_TOKEN');
  }

  try {
    const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: HF_MODEL_ID,
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that only pulls answers from the provided document text. If the answer is not present, respond with "I do not know based on this document."',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('HF API error:', response.status, text);
      throw new Error('HF Inference API error');
    }

    const data = await response.json();

    // Response mirrors OpenAI chat completions: { choices: [ { message: { content } } ] }
    const firstChoice = data?.choices?.[0]?.message;
    if (firstChoice?.content) {
      return String(firstChoice.content);
    }

    console.warn('Unexpected HF response format:', data);
    return typeof data === 'string' ? data : JSON.stringify(data);
  } catch (err) {
    // Re-throw with a clearer message so /chat can decide when to fallback.
    console.error('Failed to reach Hugging Face:', err);
    throw err;
  }
}

// -------- In-memory document store --------
interface StoredDocument {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  text: string; // full extracted text
}

// Map<documentId, StoredDocument>
const documents = new Map<string, StoredDocument>();

// -------- File upload setup (Multer) --------
const upload = multer({ storage: multer.memoryStorage() });

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'AI Knowledge Sidekick backend is running' });
});

// -------- POST /documents --------
// Expects: form-data with field "file"
// Returns: { id, name, size, uploadedAt }
app.post('/documents', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Support plain text and PDF files
    const isText = file.mimetype === 'text/plain';
    const isPdf = file.mimetype === 'application/pdf';

    if (!isText && !isPdf) {
      return res
        .status(400)
        .json({ error: 'Only .txt and .pdf files are supported for now.' });
    }

    let text: string;

    if (isText) {
      text = file.buffer.toString('utf-8');
    } else {
      try {
        text = await extractPdfTextFromBuffer(file.buffer);
      } catch (parseError) {
        console.error('Unable to extract text from PDF', parseError);
        return res
          .status(422)
          .json({ error: 'Could not read text from that PDF. Try another file.' });
      }

      if (!text.trim()) {
        console.warn(
          `No text extracted from PDF "${file.originalname}". It may be a scanned image or have unusual encoding.`
        );
      }
    }

    const id = `doc_${Date.now()}`;
    const uploadedAt = new Date().toISOString();

    const storedDoc: StoredDocument = {
      id,
      name: file.originalname,
      size: file.size,
      uploadedAt,
      text,
    };

    documents.set(id, storedDoc);

    // Return the subset that matches your frontend DocumentItem
    res.json({
      id,
      name: storedDoc.name,
      size: storedDoc.size,
      uploadedAt: storedDoc.uploadedAt,
    });
  } catch (err) {
    console.error('Error in /documents:', err);
    res.status(500).json({ error: 'Failed to upload document.' });
  }
});

// POST /chat
// Expects: { documentId: string, messages: ChatMessage[], newMessage: string }
app.post('/chat', async (req, res) => {
  try {
    const { documentId, newMessage } = req.body as {
      documentId?: string;
      messages?: any[];
      newMessage?: string;
    };

    if (!documentId || !newMessage) {
      return res
        .status(400)
        .json({ error: 'documentId and newMessage are required.' });
    }

    const doc = documents.get(documentId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    const prompt = `
You are a helpful assistant answering questions about a document.

Rules:
- Only use information that comes from the document text.
- If the answer is not clearly in the document, say "I don't know based on this document."
- Be concise. Use bullet points when listing items.

Document:
${doc.text}

Question:
${newMessage}
`;

    let answerText: string;
    try {
      answerText = await askHuggingFace(prompt);
    } catch (hfError) {
      console.warn('Falling back to local summarizer due to HF error.');
      answerText = buildFallbackAnswer(doc, newMessage);
    }

    const assistantMessage = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: answerText,
      createdAt: new Date().toISOString(),
      citations: [] as string[],
    };

    res.json(assistantMessage);
  } catch (err) {
    console.error('Error in /chat:', err);
    res.status(500).json({ error: 'Failed to generate answer.' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});

async function extractPdfTextFromBuffer(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text ?? '';
  } finally {
    try {
      await parser.destroy();
    } catch (cleanupError) {
      console.warn('Failed to clean up PDF parser instance', cleanupError);
    }
  }
}

function buildFallbackAnswer(doc: StoredDocument, question: string): string {
  const text = doc.text.trim();
  if (!text) {
    return `I received your question about "${doc.name}", but I couldn't read any text from that upload yet.`;
  }

  const snippets = selectRelevantSnippets(text, question);
  const intro = `I could not reach Hugging Face, so here is a quick summary pulled directly from "${doc.name}":`;
  const bullets = snippets.map((snippet) => `• ${snippet}`).join('\n');
  return `${intro}\n${bullets}`;
}

function selectRelevantSnippets(text: string, question: string): string[] {
  const normalized = text.replace(/\r/g, '');
  const paragraphs = normalized
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return ['(Document contains text but no parsable sentences.)'];
  }

  const keywords = question
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 3);

  const relevant = paragraphs.filter((paragraph) => {
    const lower = paragraph.toLowerCase();
    return keywords.some((keyword) => lower.includes(keyword));
  });

  const selections = relevant.length > 0 ? relevant : paragraphs;
  return selections.slice(0, 3).map((snippet) => truncate(snippet));
}

function truncate(snippet: string): string {
  const collapsed = snippet.replace(/\s+/g, ' ');
  if (collapsed.length <= 280) {
    return collapsed;
  }
  return `${collapsed.slice(0, 277)}...`;
}
