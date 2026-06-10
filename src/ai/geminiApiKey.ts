export const GEMINI_API_KEY_STORAGE_KEY = 'gemini_api_key';
const GEMINI_API_KEY_CHANGED_EVENT = 'gemini-api-key-changed';

function safeStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function dispatchKeyChange() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(GEMINI_API_KEY_CHANGED_EVENT));
}

export function getStoredGeminiApiKey() {
  const storage = safeStorage();
  if (!storage) {
    return null;
  }

  const value = storage.getItem(GEMINI_API_KEY_STORAGE_KEY)?.trim();
  return value ? value : null;
}

export function hasStoredGeminiApiKey() {
  return Boolean(getStoredGeminiApiKey());
}

export function setStoredGeminiApiKey(apiKey: string) {
  const storage = safeStorage();
  const value = apiKey.trim();

  if (!storage || !value) {
    return;
  }

  storage.setItem(GEMINI_API_KEY_STORAGE_KEY, value);
  dispatchKeyChange();
}

export function clearStoredGeminiApiKey() {
  const storage = safeStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
  dispatchKeyChange();
}

export function subscribeToGeminiApiKeyChanges(handler: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const storageListener = (event: StorageEvent) => {
    if (event.key === GEMINI_API_KEY_STORAGE_KEY) {
      handler();
    }
  };

  window.addEventListener(GEMINI_API_KEY_CHANGED_EVENT, handler);
  window.addEventListener('storage', storageListener);

  return () => {
    window.removeEventListener(GEMINI_API_KEY_CHANGED_EVENT, handler);
    window.removeEventListener('storage', storageListener);
  };
}