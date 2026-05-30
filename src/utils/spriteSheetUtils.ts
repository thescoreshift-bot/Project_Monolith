import { publicAsset } from './publicAsset'

export type ResolvedSpriteDimensions = {
  frameWidth: number
  frameHeight: number
  sheetWidth: number
  sheetHeight: number
}

export function warnSpriteSheet(message: string): void {
  if (import.meta.env.DEV) {
    console.warn(`[SpriteSheet] ${message}`)
  }
}

/** Turn JPEG black backdrop into transparency (soft edge above threshold). */
export function applyBlackKeyToImageData(
  imageData: ImageData,
  threshold: number,
  softEdge = 36,
): void {
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!
    const g = data[i + 1]!
    const b = data[i + 2]!
    const peak = Math.max(r, g, b)
    if (peak <= threshold) {
      data[i + 3] = 0
    } else if (peak < threshold + softEdge) {
      data[i + 3] = Math.floor((255 * (peak - threshold)) / softEdge)
    }
  }
}

export function resolveStripFrameDimensions(
  naturalWidth: number,
  naturalHeight: number,
  frameCount: number,
  frameWidth?: number,
  frameHeight?: number,
): ResolvedSpriteDimensions | null {
  if (frameCount <= 1) {
    warnSpriteSheet('frameCount must be greater than 1 for animation')
    return null
  }

  let fw = frameWidth ?? 0
  let fh = frameHeight ?? naturalHeight

  if (fw <= 0) {
    fw = Math.floor(naturalWidth / frameCount)
  }
  if (fh <= 0) {
    fh = naturalHeight
  }

  if (fw <= 0) {
    warnSpriteSheet('frameWidth must be positive')
    return null
  }

  if (naturalWidth % frameCount !== 0 && frameWidth == null) {
    warnSpriteSheet(
      `image width ${naturalWidth} is not evenly divisible by frameCount ${frameCount}; using frameWidth=${fw}`,
    )
  } else if (frameWidth != null && naturalWidth % frameCount !== 0) {
    const expected = fw * frameCount
    if (expected !== naturalWidth) {
      warnSpriteSheet(
        `frameWidth * frameCount (${expected}) does not match image width (${naturalWidth})`,
      )
    }
  }

  return {
    frameWidth: fw,
    frameHeight: fh,
    sheetWidth: naturalWidth,
    sheetHeight: naturalHeight,
  }
}

const imageLoadCache = new Map<string, Promise<HTMLImageElement>>()

export function loadSpriteSheetImage(url: string): Promise<HTMLImageElement> {
  const resolved = publicAsset(url)
  const cached = imageLoadCache.get(resolved)
  if (cached) return cached

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load sprite sheet: ${url}`))
    img.src = resolved
  })
  imageLoadCache.set(resolved, promise)
  return promise
}
