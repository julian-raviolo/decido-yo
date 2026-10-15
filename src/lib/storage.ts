/** Wrapper seguro de localStorage (SSR / modo privado / cuota llena). */
export const storage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
  remove(key: string) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export const STORAGE_KEYS = {
  profile: 'decido-yo:profile',
  settings: 'decido-yo:settings',
  decks: 'decido-yo:weekly-decks-v3',
  unlocks: 'decido-yo:unlocks',
  room: 'decido-yo:room-v3',
} as const;
