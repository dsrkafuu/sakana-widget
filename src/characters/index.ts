import type { SakanaWidgetCharacter } from '../types';
import _chisato from './chisato.png';
import _takina from './takina.png';

export const chisato: SakanaWidgetCharacter = {
  image: _chisato,
  props: {
    i: 0.08,
    s: 0.1,
    d: 0.99,
  },
  initialState: {
    r: 1,
    y: 40,
    t: 0,
    w: 0,
  },
};

export const takina: SakanaWidgetCharacter = {
  image: _takina,
  props: {
    i: 0.08,
    s: 0.1,
    d: 0.988,
  },
  initialState: {
    r: 12,
    y: 2,
    t: 0,
    w: 0,
  },
};
