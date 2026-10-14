import { useCallback, useEffect, useState } from 'react';
import {
  getSoundEnabled,
  prefersReducedMotion,
  setSoundEnabled,
  SOUND_ENABLED_STORAGE_KEY,
} from '@/shared/lib/sounds';

export function useSoundEnabled() {
  const [enabled, setEnabled] = useState(getSoundEnabled);

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

  return {
    soundEnabled: enabled,
    toggleSound: toggle,
    prefersReducedMotion: prefersReducedMotion(),
  };
}
