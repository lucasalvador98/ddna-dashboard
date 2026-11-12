export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: {
    fileName: string;
    categoria?: string;
    chunkIndex?: number;
    similarity?: number;
  }[];
  tools_used?: string[];
  timestamp: Date;
}

const HISTORY_VERSION = 1;
const MAX_HISTORY_MESSAGES = 80;
const MAX_HISTORY_CHARACTERS = 750_000;

export function chatHistoryStorageKey(userId: string): string {
  return `ddna-dashboard:repository-chat:active:v${HISTORY_VERSION}:${encodeURIComponent(userId)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseMessage(value: unknown): ChatMessage | null {
  if (
    !isRecord(value) ||
    (value.role !== 'user' && value.role !== 'assistant') ||
    typeof value.content !== 'string' ||
    typeof value.timestamp !== 'string'
  ) {
    return null;
  }

  const timestamp = new Date(value.timestamp);
  if (Number.isNaN(timestamp.getTime())) return null;

  const message: ChatMessage = { role: value.role, content: value.content, timestamp };
  if (Array.isArray(value.sources)) {
    message.sources = value.sources.flatMap((source) => {
      if (!isRecord(source) || typeof source.fileName !== 'string') return [];
      return [{
        fileName: source.fileName,
        ...(typeof source.categoria === 'string' ? { categoria: source.categoria } : {}),
        ...(typeof source.chunkIndex === 'number' ? { chunkIndex: source.chunkIndex } : {}),
        ...(typeof source.similarity === 'number' ? { similarity: source.similarity } : {}),
      }];
    });
  }
  if (Array.isArray(value.tools_used)) {
    message.tools_used = value.tools_used.filter((tool): tool is string => typeof tool === 'string');
  }
  return message;
}

function removeStoredHistory(storage: Storage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // Storage may be unavailable or read-only in this browser context.
  }
}

export function readChatHistory(userId: string): ChatMessage[] {
  const key = chatHistoryStorageKey(userId);
  let storage: Storage;
  let serialized: string | null;
  try {
    storage = window.localStorage;
    serialized = storage.getItem(key);
  } catch {
    return [];
  }
  if (serialized === null) return [];

  try {
    const payload: unknown = JSON.parse(serialized);
    if (
      !isRecord(payload) ||
      payload.version !== HISTORY_VERSION ||
      !Array.isArray(payload.messages)
    ) {
      throw new Error('Invalid chat history payload');
    }
    const messages = payload.messages.map(parseMessage);
    if (messages.some((message) => message === null)) throw new Error('Invalid chat message');
    return messages.filter((message): message is ChatMessage => message !== null).slice(-MAX_HISTORY_MESSAGES);
  } catch {
    removeStoredHistory(storage, key);
    return [];
  }
}

export function writeChatHistory(userId: string, messages: ChatMessage[]): void {
  const key = chatHistoryStorageKey(userId);
  let storage: Storage | null = null;
  try {
    storage = window.localStorage;
    if (messages.length === 0) {
      removeStoredHistory(storage, key);
      return;
    }

    const boundedMessages = messages.slice(-MAX_HISTORY_MESSAGES);
    let serialized = JSON.stringify({ version: HISTORY_VERSION, messages: boundedMessages });
    while (serialized.length > MAX_HISTORY_CHARACTERS && boundedMessages.length > 0) {
      boundedMessages.shift();
      serialized = JSON.stringify({ version: HISTORY_VERSION, messages: boundedMessages });
    }
    storage.setItem(key, serialized);
  } catch {
    if (storage) removeStoredHistory(storage, key);
  }
}

export function clearChatHistory(userId: string): void {
  try {
    window.localStorage.removeItem(chatHistoryStorageKey(userId));
  } catch {
    // Clearing local history must not interrupt chat.
  }
}
