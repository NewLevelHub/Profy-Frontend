/**
 * Мascot sprite geometry — ported verbatim from the design team's reference
 * prototype ("Profy Mascot.dc.html", DCLogic). Do not hand-tune these numbers;
 * they're calibrated against the source PNGs (eye bounding boxes + head
 * centers, both in % of the full sprite image).
 *
 * `eyes: null` means the sprite's eyes are already closed/obscured by the
 * pose itself (e.g. looking down at a page, medal ceremony) — blinking is
 * intentionally disabled for those states, not a missing-data bug.
 */

/** Eye bounding box as [x%, y%, width%, height%] of the sprite image. */
export type MascotEyeBox = [number, number, number, number];

export interface MascotSpriteEntry {
  /** Filename under /mascot/ (state sprites) or /mascot/pro/ (profession sprites). */
  file: string;
  alt: string;
  eyes: [MascotEyeBox, MascotEyeBox] | null;
  /** Head center as [x%, y%] of the sprite image — used for compact-mode cropping. */
  head: [number, number];
}

/**
 * The 6 functional states actually used by the product (ТЗ 14.3). These are
 * the only states wired into any screen.
 */
export type MascotFunctionalState =
  | 'welcome'
  | 'transition'
  | 'rest'
  | 'completion'
  | 'waiting'
  | 'pause'
  | 'graduate';

export const SPRITES: Record<MascotFunctionalState, MascotSpriteEntry> = {
  welcome: {
    file: 'mascot-v2-greeting.png',
    alt: 'Маскот Profy · приветствие',
    eyes: [
      [32.5, 28.9, 5.8, 7.8],
      [50.6, 31.5, 6.3, 8.2],
    ],
    head: [47.5, 22.3],
  },
  transition: {
    file: 'mascot-v2-notepad.png',
    alt: 'Маскот Profy · переход между блоками',
    eyes: [
      [25.8, 31.5, 6.5, 7.8],
      [48.1, 33.7, 7.3, 8.0],
    ],
    head: [48.2, 20.9],
  },
  rest: {
    file: 'mascot-v2-glass.png',
    alt: 'Маскот Profy · привал',
    eyes: [
      [30.5, 29.6, 5.9, 8.3],
      [51.1, 31.2, 6.7, 8.7],
    ],
    head: [46.5, 21.2],
  },
  completion: {
    file: 'mascot-v2-medal.png',
    alt: 'Маскот Profy · завершение',
    // Eyes closed on the sprite itself — blink disabled for this state.
    eyes: null,
    head: [54.0, 21.0],
  },
  waiting: {
    file: 'mascot-v2-book.png',
    alt: 'Маскот Profy · ожидание',
    // Eyes looking down at the page on the sprite — blink disabled.
    eyes: null,
    head: [52.7, 20.9],
  },
  pause: {
    file: 'mascot-v2-pause.png',
    alt: 'Маскот Profy · пауза',
    eyes: [
      [28.55, 33.58, 6.36, 8.88],
      [49.31, 33.73, 6.5, 9.03],
    ],
    head: [42.14, 24.45],
  },
  // Not part of the original ТЗ 14.3 six — added for university/program
  // pages (mortarboard + gown + backpack reads as "off to study"). Eyes
  // already drawn open on the sprite with no distinct closed-lid art, so
  // blink stays disabled like `completion`/`waiting`.
  graduate: {
    file: 'univer.png',
    alt: 'Маскот Profy · университет',
    eyes: null,
    head: [50, 22],
  },
};

/**
 * The 20-profession pool. NOT wired into any product state/screen — this is
 * a self-contained data set held ready for future use. `Mascot` can render
 * any of these by state name, but nothing in the app currently passes one.
 */
export type MascotProfessionState =
  | 'doctor'
  | 'engineer'
  | 'developer'
  | 'chemist'
  | 'artist'
  | 'musician'
  | 'chef'
  | 'architect'
  | 'footballer'
  | 'pilot'
  | 'photographer'
  | 'lawyer'
  | 'vet'
  | 'gardener'
  | 'actor'
  | 'journalist'
  | 'gamer'
  | 'baker'
  | 'astronomer'
  | 'entrepreneur';

export const PRO: Record<MascotProfessionState, MascotSpriteEntry> = {
  doctor: {
    file: 'pro/doctor.png',
    alt: 'Маскот Profy · врач',
    eyes: [
      [28.63, 33.21, 5.81, 7.14],
      [48.13, 35, 6.22, 7.14],
    ],
    head: [41.39, 26.18],
  },
  engineer: {
    file: 'pro/engineer.png',
    alt: 'Маскот Profy · инженер',
    eyes: [
      [33.2, 35.92, 5.47, 7.04],
      [51.95, 37.32, 6.25, 7.39],
    ],
    head: [45.51, 28.73],
  },
  developer: {
    file: 'pro/developer.png',
    alt: 'Маскот Profy · программист',
    eyes: [
      [37.87, 34.16, 5.51, 7.12],
      [55.15, 36.65, 5.88, 7.12],
    ],
    head: [49.36, 27.47],
  },
  chemist: {
    file: 'pro/chemist.png',
    alt: 'Маскот Profy · химик',
    eyes: null,
    head: [46, 29],
  },
  artist: {
    file: 'pro/artist.png',
    alt: 'Маскот Profy · художник',
    eyes: [
      [29.64, 35.13, 5.93, 7.17],
      [48.62, 37.63, 5.93, 7.17],
    ],
    head: [42.09, 28.46],
  },
  musician: {
    file: 'pro/musician.png',
    alt: 'Маскот Profy · музыкант',
    eyes: null,
    head: [41.8, 26.7],
  },
  chef: {
    file: 'pro/chef.png',
    alt: 'Маскот Profy · повар',
    eyes: [
      [32.4, 36.7, 6.06, 6.57],
      [51.1, 40.1, 6.06, 6.57],
    ],
    head: [44.98, 30.29],
  },
  architect: {
    file: 'pro/architect.png',
    alt: 'Маскот Profy · архитектор',
    eyes: [
      [39.78, 34.66, 5.38, 7.22],
      [56.63, 37.18, 5.73, 7.22],
    ],
    head: [50.99, 28.03],
  },
  footballer: {
    file: 'pro/footballer.png',
    alt: 'Маскот Profy · футболист',
    eyes: [
      [35.11, 33.33, 5.73, 7.53],
      [53.44, 36.2, 5.73, 7.17],
    ],
    head: [47.14, 26.94],
  },
  pilot: {
    file: 'pro/pilot.png',
    alt: 'Маскот Profy · пилот',
    eyes: [
      [37.77, 35.36, 4.68, 6.79],
      [54.32, 38.21, 5.04, 7.14],
    ],
    head: [48.47, 28.77],
  },
  photographer: {
    file: 'pro/photographer.png',
    alt: 'Маскот Profy · фотограф',
    eyes: null,
    head: [41.5, 28.4],
  },
  lawyer: {
    file: 'pro/lawyer.png',
    alt: 'Маскот Profy · юрист',
    eyes: [
      [32.28, 34.53, 5.91, 7.19],
      [51.57, 37.05, 5.91, 7.19],
    ],
    head: [44.88, 27.89],
  },
  vet: {
    file: 'pro/vet.png',
    alt: 'Маскот Profy · ветеринар',
    eyes: [
      [36.19, 34.53, 5.6, 7.19],
      [53.73, 37.05, 6.34, 7.55],
    ],
    head: [47.95, 27.98],
  },
  gardener: {
    file: 'pro/gardener.png',
    alt: 'Маскот Profy · садовник',
    eyes: [
      [36.9, 34.41, 5.54, 7.53],
      [54.61, 36.92, 5.54, 7.17],
    ],
    head: [48.52, 27.84],
  },
  actor: {
    file: 'pro/actor.png',
    alt: 'Маскот Profy · актёр',
    eyes: null,
    head: [46.8, 28.2],
  },
  journalist: {
    file: 'pro/journalist.png',
    alt: 'Маскот Profy · журналист',
    eyes: [
      [29.23, 32.82, 5.77, 7.25],
      [47.31, 34.73, 5.77, 7.63],
    ],
    head: [41.15, 26],
  },
  gamer: {
    file: 'pro/gamer.png',
    alt: 'Маскот Profy · геймер',
    eyes: [
      [30.2, 37.55, 6.12, 7.66],
      [49.8, 40.61, 6.12, 7.28],
    ],
    head: [43.06, 31.32],
  },
  baker: {
    file: 'pro/baker.png',
    alt: 'Маскот Profy · пекарь',
    eyes: [
      [34.75, 37.4, 5.79, 7.63],
      [52.9, 40.08, 6.18, 7.63],
    ],
    head: [46.81, 31.06],
  },
  astronomer: {
    file: 'pro/astronomer.png',
    alt: 'Маскот Profy · астроном',
    eyes: null,
    head: [54.7, 30.5],
  },
  entrepreneur: {
    file: 'pro/entrepreneur.png',
    alt: 'Маскот Profy · предприниматель',
    eyes: [
      [34.09, 36.4, 5.68, 8.05],
      [52.27, 38.7, 6.06, 8.05],
    ],
    head: [46.12, 30.07],
  },
};

/** Union of every state the `Mascot` component can render. */
export type MascotState = MascotFunctionalState | MascotProfessionState;

/** Combined lookup table — functional + profession sprites, keyed by state name. */
export const ALL_SPRITES: Record<MascotState, MascotSpriteEntry> = {
  ...SPRITES,
  ...PRO,
};

/** Public path all sprite files are served from (see public/mascot/README.md). */
export const MASCOT_ASSET_BASE = '/mascot/';
