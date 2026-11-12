import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  chatHistoryStorageKey,
  clearChatHistory,
  readChatHistory,
  writeChatHistory,
  type ChatMessage,
} from './chat-history';

const localStorageDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');

function message(role: ChatMessage['role'], content: string, minute = 0): ChatMessage {
  return {
    role,
    content,
    timestamp: new Date(`2026-11-12T10:${String(minute).padStart(2, '0')}:00.000Z`),
  };
}

describe('browser chat history storage', () => {
  beforeEach(() => localStorage.clear());

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    if (localStorageDescriptor) Object.defineProperty(window, 'localStorage', localStorageDescriptor);
    localStorage.clear();
  });

  it('uses a versioned, per-user storage key', () => {
    expect(chatHistoryStorageKey('user/a')).toBe(
      'ddna-dashboard:repository-chat:active:v1:user%2Fa',
    );
    expect(chatHistoryStorageKey('user/a')).not.toBe(chatHistoryStorageKey('user/b'));
  });

  it('round-trips messages and restores timestamps as Date instances', () => {
    const messages = [message('user', 'Consulta', 1), message('assistant', 'Respuesta', 2)];

    writeChatHistory('user-1', messages);

    const restored = readChatHistory('user-1');
    expect(restored).toEqual(messages);
    expect(restored[0].timestamp).toBeInstanceOf(Date);
  });

  it('clears only the selected user history', () => {
    writeChatHistory('user-1', [message('assistant', 'Privado 1')]);
    writeChatHistory('user-2', [message('assistant', 'Privado 2')]);

    clearChatHistory('user-1');

    expect(readChatHistory('user-1')).toEqual([]);
    expect(readChatHistory('user-2').map((entry) => entry.content)).toEqual(['Privado 2']);
  });

  it('removes malformed or unsupported-version payloads and returns an empty history', () => {
    const key = chatHistoryStorageKey('user-1');
    localStorage.setItem(key, '{not-json');
    expect(readChatHistory('user-1')).toEqual([]);
    expect(localStorage.getItem(key)).toBeNull();

    localStorage.setItem(key, JSON.stringify({ version: 99, messages: [] }));
    expect(readChatHistory('user-1')).toEqual([]);
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('bounds persisted history to its most recent messages', () => {
    const messages = Array.from({ length: 90 }, (_, index) => message('user', `Message ${index}`, index % 60));

    writeChatHistory('user-1', messages);

    const restored = readChatHistory('user-1');
    expect(restored).toHaveLength(80);
    expect(restored[0].content).toBe('Message 10');
    expect(restored.at(-1)?.content).toBe('Message 89');
  });

  it('keeps callers safe when localStorage cannot be read or written', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => { throw new Error('Storage unavailable'); },
    });

    expect(readChatHistory('user-1')).toEqual([]);
    expect(() => writeChatHistory('user-1', [message('user', 'Consulta')])).not.toThrow();
    expect(() => clearChatHistory('user-1')).not.toThrow();
  });

  it('keeps callers safe when writing exceeds the browser storage quota', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    expect(() => writeChatHistory('user-1', [message('user', 'Consulta')])).not.toThrow();
    expect(readChatHistory('user-1')).toEqual([]);
  });
});
