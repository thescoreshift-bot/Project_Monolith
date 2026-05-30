/** Background music loop tracks (files in /public/audio/). */
import { publicAsset } from './publicAsset'

export type BgmTrackId = 'main_menu' | 'combat_3' | 'healing_stationary' | 'game_bonus'

/** Short event stingers (non-looping). */
export type SfxTrackId = 'game_reward'

const BGM_TRACKS: Record<BgmTrackId, { src: string; volume: number }> = {
  main_menu: { src: '/audio/main_menu.mp3', volume: 0.55 },
  combat_3: { src: '/audio/combat_3.mp3', volume: 0.5 },
  healing_stationary: { src: '/audio/healing_stationary.mp3', volume: 0.5 },
  game_bonus: { src: '/audio/game_bonus.mp3', volume: 0.65 },
}

const SFX_TRACKS: Record<SfxTrackId, { src: string; volume: number }> = {
  game_reward: { src: '/audio/game_reward.mp3', volume: 0.7 },
}

const MUSIC_ENABLED_KEY = 'monolith-music-enabled'

let bgmEl: HTMLAudioElement | null = null
let currentBgm: BgmTrackId | null = null
let encounterBgmEl: HTMLAudioElement | null = null
let encounterBgmSrc: string | null = null
let audioUnlocked = false
let fadeTimer: ReturnType<typeof setInterval> | null = null

function isMusicEnabled(): boolean {
  try {
    const raw = localStorage.getItem(MUSIC_ENABLED_KEY)
    if (raw === 'false') return false
  } catch {
    /* ignore */
  }
  return true
}

export function setMusicEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(MUSIC_ENABLED_KEY, enabled ? 'true' : 'false')
  } catch {
    /* ignore */
  }
  if (!enabled) {
    stopBgm()
    stopEncounterBattleMusic()
  }
}

export function isMusicEnabledSetting(): boolean {
  return isMusicEnabled()
}

/** Call once after a user gesture so browsers allow playback. */
export function unlockAudio(): void {
  audioUnlocked = true
  if (!isMusicEnabled()) return
  if (encounterBgmEl) {
    void encounterBgmEl.play().catch(() => {})
  } else if (bgmEl && currentBgm) {
    void bgmEl.play().catch(() => {})
  }
}

function clearFadeTimer(): void {
  if (fadeTimer !== null) {
    clearInterval(fadeTimer)
    fadeTimer = null
  }
}

function stopBgmElement(el: HTMLAudioElement): void {
  clearFadeTimer()
  el.pause()
  el.currentTime = 0
}

export function stopBgm(): void {
  if (bgmEl) {
    stopBgmElement(bgmEl)
    bgmEl = null
  }
  currentBgm = null
}

export function playBgm(track: BgmTrackId): void {
  if (!isMusicEnabled()) return
  if (currentBgm === track && bgmEl && !bgmEl.paused) return

  stopBgm()

  const def = BGM_TRACKS[track]
  const el = new Audio(publicAsset(def.src))
  el.loop = true
  el.volume = def.volume
  el.preload = 'auto'

  const start = () => {
    if (!audioUnlocked) return
    void el.play().catch(() => {})
  }

  el.addEventListener('canplaythrough', start, { once: true })
  void el.load()

  bgmEl = el
  currentBgm = track
  if (audioUnlocked) start()
}

export function playSfx(track: SfxTrackId): void {
  if (!isMusicEnabled()) return
  const def = SFX_TRACKS[track]
  const el = new Audio(publicAsset(def.src))
  el.volume = def.volume
  el.preload = 'auto'
  const play = () => {
    if (!audioUnlocked) return
    void el.play().catch(() => {})
  }
  el.addEventListener('canplaythrough', play, { once: true })
  void el.load()
  if (audioUnlocked) play()
}

const ABILITY_SFX_VOLUME = 0.62

/** Combat ability sound (one-shot). sfxKey is a file stem under /audio/sfx/. */
export function playAbilitySfx(sfxKey: string): void {
  if (!isMusicEnabled() || !sfxKey) return
  const el = new Audio(publicAsset(`/audio/sfx/${sfxKey}.mp3`))
  el.volume = ABILITY_SFX_VOLUME
  const play = () => {
    if (!audioUnlocked) return
    void el.play().catch(() => {})
  }
  el.addEventListener('canplaythrough', play, { once: true })
  void el.load()
  if (audioUnlocked) play()
}

/** Screens that use main menu music. */
export function isMainMenuScreen(screen: string): boolean {
  return (
    screen === 'title' ||
    screen === 'login' ||
    screen === 'register' ||
    screen === 'account' ||
    screen === 'characterSelect' ||
    screen === 'nameTrainer' ||
    screen === 'profileSetup' ||
    screen === 'patchNotes' ||
    screen === 'dailyRun' ||
    screen === 'leaderboard' ||
    screen === 'settings'
  )
}

export function bgmTrackForScreen(screen: string): BgmTrackId | null {
  if (isMainMenuScreen(screen)) return 'main_menu'
  if (screen === 'encounterTransition' || screen === 'combat') return null
  if (screen === 'recoveryStation') return 'healing_stationary'
  if (screen === 'event') return 'game_bonus'
  return null
}

const ENCOUNTER_BATTLE_VOLUME = 0.36

export type EncounterAudioProfile = 'battleRandom' | 'eliteBoss'

function encounterMusicSrc(profile: EncounterAudioProfile): string {
  if (profile === 'eliteBoss') return publicAsset('/audio/elite_boss_encounter.mp3')
  const n = 1 + Math.floor(Math.random() * 3)
  return publicAsset(`/audio/battle_encounter${n}.mp3`)
}

/** Looping battle music from encounter through fight until stopEncounterBattleMusic(). */
export function startEncounterBattleMusic(
  profile: EncounterAudioProfile,
): void {
  if (!isMusicEnabled()) return

  const src = encounterMusicSrc(profile)
  if (encounterBgmSrc === src && encounterBgmEl && !encounterBgmEl.paused) {
    return
  }

  stopEncounterBattleMusic()
  stopBgm()

  const el = new Audio(publicAsset(src))
  el.loop = true
  el.volume = ENCOUNTER_BATTLE_VOLUME
  el.preload = 'auto'

  const start = () => {
    if (!audioUnlocked) return
    void el.play().catch(() => {})
  }

  el.addEventListener('canplaythrough', start, { once: true })
  el.addEventListener('error', () => {
    encounterBgmEl = null
    encounterBgmSrc = null
  }, { once: true })
  void el.load()

  encounterBgmEl = el
  encounterBgmSrc = src
  if (audioUnlocked) start()
}

export function stopEncounterBattleMusic(): void {
  if (encounterBgmEl) {
    encounterBgmEl.pause()
    encounterBgmEl.currentTime = 0
    encounterBgmEl = null
  }
  encounterBgmSrc = null
}

/** @deprecated Use startEncounterBattleMusic — kept for imports. */
export function playEncounterTransitionSting(profile: EncounterAudioProfile): void {
  startEncounterBattleMusic(profile)
}
