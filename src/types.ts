/** Describes the physics properties for a widget. */
export interface SakanaWidgetProps {
  /**
   * Inertia for the widget.
   */
  readonly i: number;
  /**
   * Stickiness for the widget.
   */
  readonly s: number;
  /**
   * How fast would the widget stop (decay).
   */
  readonly d: number;
}

/** Describes the physics state for a widget at a specific time. */
export interface SakanaWidgetState {
  /**
   * The angle for the widget.
   */
  r: number;
  /**
   * The y coords for the widget.
   */
  y: number;
  /**
   * Y-axis speed for the widget.
   */
  t: number;
  /**
   * X-Axis speed for the widget.
   */
  w: number;
}

export interface SakanaWidgetCharacter {
  image: string;
  props: SakanaWidgetProps;
  initialState: SakanaWidgetState;
}

export type SakanaWidgetCharacterConfiguration = Omit<
  SakanaWidgetCharacter,
  'image'
>;

export type SakanaWidgetRegistry = Record<string, SakanaWidgetCharacter>;

export interface SakanaWidgetOptions {
  /**
   * sakana registry
   */
  registry: SakanaWidgetRegistry;
  /**
   * widget size, default to `200`
   */
  size: number;
  /**
   * auto fit size (120px minimum), default to `false`
   */
  autoFit: boolean;
  /**
   * controls bar, default to `true`
   */
  controls: boolean;
  /**
   * show spring rod, default to `true`
   */
  rod: boolean;
  /**
   * character draggable, default to `true`
   */
  draggable: boolean;
  /**
   * canvas stroke settings, default to `#b4b4b4` & `10`
   */
  stroke: {
    color: string;
    width: number;
  };
  /**
   * motion stop threshold, default to `0.1`
   */
  threshold: number;
  /**
   * rotate origin, default to `0`
   */
  rotate: number;
  /**
   * enable accessibility title feature, default to `false`
   */
  title: boolean;
}
