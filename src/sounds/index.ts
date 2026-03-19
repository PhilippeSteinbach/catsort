/**
 * Cat sound registry.
 * To add a new sound:
 *   1. Drop the .mp3 file into src/sounds/
 *   2. Import it below
 *   3. Add an entry to CAT_SOUNDS
 */

import meow from './meow.mp3';
import meow1 from './meow-1.mp3';
import meowFunny from './meow-funny.mp3';
// import purr   from './purr.mp3';
// import hiss   from './hiss.mp3';

export interface CatSound {
  id: string;
  label: string;
  url: string;
}

export const CAT_SOUNDS: CatSound[] = [
  { id: 'meow',       label: '🐱 Meow',       url: meow      },
  { id: 'meow-1',     label: '🐱 Meow 2',     url: meow1     },
  { id: 'meow-funny', label: '😹 Funny Meow', url: meowFunny },
  // { id: 'purr',  label: '😸 Schnurren', url: purr  },
  // { id: 'hiss',  label: '🙀 Zischen',   url: hiss  },
];

export const DEFAULT_SOUND_ID = 'meow';
