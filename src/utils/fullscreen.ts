export function isFullscreenSupported(): boolean {
  return typeof document.documentElement.requestFullscreen === 'function'
}

export function isAppFullscreen(): boolean {
  return document.fullscreenElement != null
}

export async function toggleAppFullscreen(): Promise<boolean> {
  if (!isFullscreenSupported()) return false
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return false
    }
    await document.documentElement.requestFullscreen()
    return true
  } catch {
    return isAppFullscreen()
  }
}
