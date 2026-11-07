// Small per-device flags. Storage can be unavailable (private mode, blocked
// site data), so every access is guarded and falls back to "not set".

const KEYS = {
  aiConsent: "mytea.aiConsent",
  noticeSeen: "mytea.noticeSeen",
} as const;

type Key = keyof typeof KEYS;

export function getPref(key: Key): string | null {
  try {
    return localStorage.getItem(KEYS[key]);
  } catch {
    return null;
  }
}

export function setPref(key: Key, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(KEYS[key]);
    else localStorage.setItem(KEYS[key], value);
  } catch {
    // ignore
  }
}

export function clearPrefs() {
  for (const key of Object.keys(KEYS) as Key[]) setPref(key, null);
}
