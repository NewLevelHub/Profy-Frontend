import { useCallback, useEffect, useState } from 'react';
import {
  CelebrationSoundId,
  getCelebrationSound,
  getSoundEnabled,
  prefersReducedMotion,
  previewCelebration,
  setCelebrationSound,
  setSoundEnabled,
  SOUND_ENABLED_STORAGE_KEY,
} from '@/shared/lib/sounds';

export function useSoundEnabled() {
  const [enabled, setEnabled] = useState(getSoundEnabled);
  const [celebrationSound, setCelebrationSoundState] = useState(getCelebrationSound);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      try {
        if (localStorage.getItem(SOUND_ENABLED_STORAGE_KEY) === null) {
          setEnabled(!media.matches);
        }
      } catch {
        setEnabled(!media.matches);
      }
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const updateEnabled = useCallback((value: boolean) => {
    setSoundEnabled(value);
    setEnabled(value);
  }, []);

  const toggle = useCallback(() => {
    updateEnabled(!enabled);
  }, [enabled, updateEnabled]);

  const updateCelebrationSound = useCallback((id: CelebrationSoundId) => {
    setCelebrationSound(id);
    setCelebrationSoundState(id);
  }, []);

  const previewSound = useCallback((id: CelebrationSoundId, finale = false) => {
    previewCelebration(id, finale);
  }, []);

  return {
    soundEnabled: enabled,
    setSoundEnabled: updateEnabled,
    toggleSound: toggle,
    prefersReducedMotion: prefersReducedMotion(),
    celebrationSound,
    setCelebrationSound: updateCelebrationSound,
    previewCelebrationSound: previewSound,
  };
}
