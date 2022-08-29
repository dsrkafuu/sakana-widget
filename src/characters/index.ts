import _chisato from './chisato.png';
import _takina from './takina.png';

export interface SakanaWidgetState {
  /**
   * inertia
   */
  i: number;
  /**
   * stickiness
   */
  s: number;
  /**
   * decay
   */
  d: number;
  /**
   * angle
   */
  r: number;
  /**
   * height
   */
  y: number;
  /**
   * vertical speed
   */
  t: number;
  /**
   * horizontal speed
   */
  w: number;
}

export interface SakanaWidgetCharacter {
  image: string;
  initialState: SakanaWidgetState;
}

const chisato: SakanaWidgetCharacter = {
  image: _chisato,
  initialState: {
    i: 0.08,
    s: 0.1,
    d: 0.99,
    r: 1,
    y: 40,
    t: 0,
    w: 0,
  },
};

const takina: SakanaWidgetCharacter = {
  image: _takina,
  initialState: {
    i: 0.08,
    s: 0.1,
    d: 0.988,
    r: 12,
    y: 2,
    t: 0,
    w: 0,
  },
};

export default {
  chisato,
  takina,
};
