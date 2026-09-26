export interface SakanaWidgetState {
  /** inertia */
  i: number;
  /** stickiness */
  s: number;
  /** decay */
  d: number;
  /** angle */
  r: number;
  /** height */
  y: number;
  /** vertical speed */
  t: number;
  /** horizontal speed */
  w: number;
}

export interface SakanaWidgetCharacter {
  image: string;
  initialState: SakanaWidgetState;
}
