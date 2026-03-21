const storageKey = (userId: string) => `formby_apikey_${userId}`

export function getApiKey(userId: string): string | null {
  try {
    return localStorage.getItem(storageKey(userId))
  } catch {
    return null
  }
}

export function saveApiKey(userId: string, key: string | null): void {
  try {
    if (key === null) localStorage.removeItem(storageKey(userId))
    else localStorage.setItem(storageKey(userId), key)
  } catch {}
}
