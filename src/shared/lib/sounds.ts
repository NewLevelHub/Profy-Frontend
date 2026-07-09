const STORAGE_KEY = 'profy-sound-enabled';
const CELEBRATION_STORAGE_KEY = 'profy-celebration-sound';

export const SOUND_ENABLED_STORAGE_KEY = STORAGE_KEY;

export type SoundVariant = 'default' | 'soft';

export type CelebrationSoundId = 'chime' | 'sparkle' | 'fanfare' | 'soft' | 'party';

export const CELEBRATION_SOUNDS: ReadonlyArray<{
  id: CelebrationSoundId;
  label: string;
  description: string;
  emoji: string;
}> = [
  { id: 'chime', label: 'Колокольчик', description: 'Два лёгких нотных удара', emoji: '🔔' },
  { id: 'sparkle', label: 'Искры', description: 'Быстрое восходящее мелодичное «та-да»', emoji: '✨' },
  { id: 'fanfare', label: 'Фанфары', description: 'Торжественная короткая фанфара', emoji: '🎺' },
  { id: 'soft', label: 'Мягкое', description: 'Спокойный однотонный аккорд', emoji: '🌸' },
  { id: 'party', label: 'Праздник', description: 'Весёлая быстрая последовательность', emoji: '🎉' },
];

type ToneNote = {
  frequency: number;
  durationSec: number;
  volume: number;
  type?: OscillatorType;
  delaySec?: number;
};

let audioContext: AudioContext | null = null;
let activeAudio: HTMLAudioElement | null = null;

// Custom block-finish sounds from public/sounds.
// Files are played in a loop by block number: 1->1st, 2->2nd, 3->3rd, 4->1st...
const BLOCK_FINISH_AUDIO_PATHS = [
  '/sounds/block-finished1.mp3',
  '/sounds/block-finished2.mp3',
  '/sounds/block-finisged3.mp3',
] as const;
const FINAL_AUDIO_PATH = '/sounds/final.mp3';

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const Ctx = window.AudioContext
      ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    audioContext = new Ctx();
  }
  return audioContext;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
  } catch {
    return false;
  }
  return !prefersReducedMotion();
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // ignore
  }
}

export function getCelebrationSound(): CelebrationSoundId {
  try {
    const stored = localStorage.getItem(CELEBRATION_STORAGE_KEY) as CelebrationSoundId | null;
    if (stored && CELEBRATION_SOUNDS.some((sound) => sound.id === stored)) {
      return stored;
    }
  } catch {
    // ignore
  }
  return 'sparkle';
}

export function setCelebrationSound(id: CelebrationSoundId): void {
  try {
    localStorage.setItem(CELEBRATION_STORAGE_KEY, id);
  } catch {
    // ignore
  }
}

export function shouldPlaySound(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.location.pathname.startsWith('/admin')) return false;
  return getSoundEnabled();
}

function stopActiveAudio() {
  if (!activeAudio) return;
  activeAudio.pause();
  activeAudio.currentTime = 0;
  activeAudio = null;
}

function tryPlayAudio(
  path: string,
  onError?: () => void,
  onEnded?: () => void,
): boolean {
  if (typeof window === 'undefined') return false;
  try {
    stopActiveAudio();
    const audio = new Audio(path);
    audio.preload = 'auto';
    audio.volume = 0.9;
    audio.onerror = () => {
      if (activeAudio === audio) activeAudio = null;
      onError?.();
    };
    audio.onended = () => {
      if (activeAudio === audio) activeAudio = null;
      onEnded?.();
    };
    void audio.play().catch(() => {
      if (activeAudio === audio) activeAudio = null;
      onError?.();
    });
    activeAudio = audio;
    return true;
  } catch {
    onError?.();
    return false;
  }
}

function playTone(
  frequency: number,
  durationSec: number,
  volume: number,
  type: OscillatorType = 'sine',
  delaySec = 0,
  force = false,
) {
  if (!force && !shouldPlaySound()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  void ctx.resume();

  const start = ctx.currentTime + delaySec;
  const end = start + durationSec;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, end);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(start);
  oscillator.stop(end);
}

function playSequence(notes: ToneNote[], force = false) {
  for (const note of notes) {
    playTone(
      note.frequency,
      note.durationSec,
      note.volume,
      note.type ?? 'sine',
      note.delaySec ?? 0,
      force,
    );
  }
}

function getCelebrationSequence(id: CelebrationSoundId, finale: boolean): ToneNote[] {
  switch (id) {
    case 'chime':
      return finale
        ? [
            { frequency: 392, durationSec: 0.1, volume: 0.08, delaySec: 0 },
            { frequency: 523, durationSec: 0.1, volume: 0.09, delaySec: 0.1 },
            { frequency: 659, durationSec: 0.14, volume: 0.1, delaySec: 0.2 },
            { frequency: 784, durationSec: 0.18, volume: 0.11, delaySec: 0.32 },
          ]
        : [
            { frequency: 523, durationSec: 0.08, volume: 0.09, delaySec: 0 },
            { frequency: 659, durationSec: 0.12, volume: 0.1, delaySec: 0.09 },
          ];
    case 'sparkle':
      return finale
        ? [
            { frequency: 523, durationSec: 0.07, volume: 0.08, delaySec: 0 },
            { frequency: 659, durationSec: 0.07, volume: 0.08, delaySec: 0.08 },
            { frequency: 784, durationSec: 0.07, volume: 0.09, delaySec: 0.16 },
            { frequency: 988, durationSec: 0.07, volume: 0.09, delaySec: 0.24 },
            { frequency: 1175, durationSec: 0.16, volume: 0.11, delaySec: 0.34 },
          ]
        : [
            { frequency: 523, durationSec: 0.07, volume: 0.08, delaySec: 0 },
            { frequency: 659, durationSec: 0.07, volume: 0.08, delaySec: 0.07 },
            { frequency: 784, durationSec: 0.07, volume: 0.09, delaySec: 0.14 },
            { frequency: 1047, durationSec: 0.12, volume: 0.1, delaySec: 0.22 },
          ];
    case 'fanfare':
      return finale
        ? [
            { frequency: 294, durationSec: 0.12, volume: 0.07, type: 'triangle', delaySec: 0 },
            { frequency: 392, durationSec: 0.1, volume: 0.08, delaySec: 0.1 },
            { frequency: 523, durationSec: 0.1, volume: 0.09, delaySec: 0.2 },
            { frequency: 659, durationSec: 0.1, volume: 0.1, delaySec: 0.3 },
            { frequency: 784, durationSec: 0.2, volume: 0.11, delaySec: 0.4 },
          ]
        : [
            { frequency: 392, durationSec: 0.09, volume: 0.08, delaySec: 0 },
            { frequency: 523, durationSec: 0.09, volume: 0.09, delaySec: 0.1 },
            { frequency: 659, durationSec: 0.14, volume: 0.1, delaySec: 0.2 },
          ];
    case 'soft':
      return finale
        ? [
            { frequency: 440, durationSec: 0.22, volume: 0.07, type: 'triangle', delaySec: 0 },
            { frequency: 554, durationSec: 0.22, volume: 0.06, type: 'triangle', delaySec: 0.05 },
            { frequency: 659, durationSec: 0.28, volume: 0.08, type: 'triangle', delaySec: 0.1 },
          ]
        : [
            { frequency: 440, durationSec: 0.18, volume: 0.08, type: 'triangle', delaySec: 0 },
            { frequency: 554, durationSec: 0.2, volume: 0.07, type: 'triangle', delaySec: 0.04 },
          ];
    case 'party':
      return finale
        ? [
            { frequency: 659, durationSec: 0.06, volume: 0.09, delaySec: 0 },
            { frequency: 784, durationSec: 0.06, volume: 0.09, delaySec: 0.07 },
            { frequency: 988, durationSec: 0.06, volume: 0.09, delaySec: 0.14 },
            { frequency: 1175, durationSec: 0.06, volume: 0.1, delaySec: 0.21 },
            { frequency: 1319, durationSec: 0.06, volume: 0.1, delaySec: 0.28 },
            { frequency: 1568, durationSec: 0.14, volume: 0.11, delaySec: 0.36 },
          ]
        : [
            { frequency: 587, durationSec: 0.06, volume: 0.09, delaySec: 0 },
            { frequency: 740, durationSec: 0.06, volume: 0.09, delaySec: 0.06 },
            { frequency: 880, durationSec: 0.06, volume: 0.09, delaySec: 0.12 },
            { frequency: 1047, durationSec: 0.1, volume: 0.1, delaySec: 0.18 },
          ];
    default:
      return getCelebrationSequence('sparkle', finale);
  }
}

export function playCelebration(options?: {
  variant?: CelebrationSoundId;
  finale?: boolean;
  preview?: boolean;
}) {
  const variant = options?.variant ?? getCelebrationSound();
  const finale = options?.finale ?? false;
  const force = options?.preview ?? false;
  playSequence(getCelebrationSequence(variant, finale), force);
}

export function playBlockFinishAudio(completedCount?: number, totalBlocks?: number) {
  if (!shouldPlaySound()) return;
  const isFinal = typeof totalBlocks === 'number' && typeof completedCount === 'number' && completedCount >= totalBlocks;

  const playSynthFallback = () => {
    playCelebration({ finale: isFinal });
  };

  if (typeof completedCount !== 'number' || completedCount <= 0) {
    playSynthFallback();
    return;
  }

  if (isFinal) {
    const playedFinal = tryPlayAudio(FINAL_AUDIO_PATH, playSynthFallback);
    if (!playedFinal) playSynthFallback();
    return;
  }

  const startIndex = (completedCount - 1) % BLOCK_FINISH_AUDIO_PATHS.length;
  let attempts = 0;

  const playAttempt = (index: number) => {
    if (attempts >= BLOCK_FINISH_AUDIO_PATHS.length) {
      playSynthFallback();
      return;
    }
    attempts += 1;
    const path = BLOCK_FINISH_AUDIO_PATHS[index];
    const played = tryPlayAudio(path, () => {
      const next = (index + 1) % BLOCK_FINISH_AUDIO_PATHS.length;
      playAttempt(next);
    });
    if (!played) {
      const next = (index + 1) % BLOCK_FINISH_AUDIO_PATHS.length;
      playAttempt(next);
    }
  };

  try {
    playAttempt(startIndex);
  } catch {
    playSynthFallback();
  }
}

export function previewCelebration(variant: CelebrationSoundId, finale = false) {
  playCelebration({ variant, finale, preview: true });
}

export function playClick(variant: SoundVariant = 'default') {
  if (variant === 'soft') {
    playTone(520, 0.055, 0.08);
    return;
  }
  playTone(640, 0.065, 0.11);
}

export function playSuccess() {
  playCelebration({ variant: 'chime' });
}

export function playError() {
  playTone(220, 0.11, 0.09, 'triangle');
}
