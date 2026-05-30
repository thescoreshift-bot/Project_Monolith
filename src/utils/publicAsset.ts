/**
 * Resolve paths from /public for itch.io (relative base) and normal hosts.
 * Use for any URL string starting with `/` (assets, audio, etc.).
 */
export function publicAsset(path: string): string {
  if (!path.startsWith('/')) return path
  const normalized = path.slice(1)
  const base = import.meta.env.BASE_URL
  if (base === '/') return path
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${normalized}`
}

/** Recursively rewrite absolute public paths in nested objects/arrays. */
export function deepPublicAssets<T>(value: T): T {
  if (typeof value === 'string') {
    return (value.startsWith('/') ? publicAsset(value) : value) as T
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepPublicAssets(item)) as T
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value)) {
      out[key] = deepPublicAssets(entry)
    }
    return out as T
  }
  return value
}
