/** Deterministic PRNG from a string seed (0..1). */
export function createSeededRng(seed: string): () => number {
  let h = 1779033703
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 343291835)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

let rngOverride: (() => number) | null = null

export function setGameRngOverride(rng: (() => number) | null): void {
  rngOverride = rng
}

export function gameRandom(): number {
  return rngOverride ? rngOverride() : Math.random()
}
