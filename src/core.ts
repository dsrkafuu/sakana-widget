/*! sakana-widget | DSRKafuU (https://dsrkafuu.net) | Copyright (c) MIT License */

import './index.scss';
import type { SakanaWidgetCharacter, SakanaWidgetState } from './characters/types';
import { svgClose, svgGitHub, svgPerson, svgSync } from './icons';
import type { RequiredDeep } from './utils';
import { cloneDeep, mergeDeep, throttle } from './utils';

type SakanaWidgetVisibility = 'show' | 'hide';

interface SakanaWidgetOptions {
  /**
   * widget size, default to `200`
   */
  size?: number;
  /**
   * auto fit size (120px minimum), default to `false`
   */
  autoFit?: boolean;
  /**
   * default character, default to `chisato`
   */
  character?: 'chisato' | 'takina' | string;
  /**
   * how the character image fits its square area, default to `cover`
   */
  imageFit?: 'cover' | 'contain';
  /**
   * controls bar, default to `true`
   */
  controls?: boolean;
  /**
   * show spring rod, default to `true`
   */
  rod?: boolean;
  /**
   * character draggable, default to `true`
   */
  draggable?: boolean;
  /**
   * rod color and width, default to `#b4b4b4` & `10`
   */
  stroke?: {
    color?: string;
    width?: number;
  };
  /**
   * motion stop threshold, default to `0.1`
   */
  threshold?: number;
  /**
   * rotate origin, default to `0`
   */
  rotate?: number;
  /**
   * enable accessibility title feature, default to `false`
   */
  title?: boolean;
  /**
   * enable persistent hide state via localStorage, default to `false`
   */
  saveState?: boolean;
  /**
   * localStorage key for persist state, default to `sakana-widget-status`
   */
  stateKey?: string;
}

interface SakanaWidgetControl {
  /** Unique identifier within this widget instance. */
  id: string;
  /** Accessible label for the icon button; never displayed as button text. */
  label: string;
  /** DOM icon. The widget clones it before inserting it. */
  icon: Element;
  onClick: (widget: SakanaWidget, event: MouseEvent) => void;
}

const defaultOptions: SakanaWidgetOptions = {
  size: 200,
  autoFit: false,
  character: 'chisato',
  imageFit: 'cover',
  controls: true,
  rod: true,
  draggable: true,
  stroke: {
    color: '#b4b4b4',
    width: 10,
  },
  threshold: 0.1,
  rotate: 0,
  title: false,
  saveState: false,
  stateKey: 'sakana-widget-status',
};

// register default characters
let _characters: Record<string, SakanaWidgetCharacter> | null = null;
function _initCharacters() {
  if (_characters) return;
  _characters = {};
}

/**
 * widget instance class
 */
class SakanaWidget {
  private _options: RequiredDeep<SakanaWidgetOptions>;

  // app metadata
  private _imageSize!: number;
  private _limit!: { maxR: number; maxY: number; minY: number };
  private _lastFrameTime: number | null = null;
  private _frameRequestId: number | null = null;
  private _running = false;
  private _mounted = false;
  private _dragging = false;
  private _stopDrag: (() => void) | null = null;
  private _magicForceTimeout = 0;
  private _magicForceEnabled = false;
  private _saveState: boolean;
  private _stateKey: string;
  private _hidden = false;
  private _stateListeners: Array<(state: SakanaWidgetVisibility) => void> = [];

  // character related
  private _char!: string;
  private _image!: string;
  private _state!: SakanaWidgetState;

  // dom element related
  private _domWrapper!: HTMLDivElement; // this is needed for resize observer
  private _domApp!: HTMLDivElement; // actual app element
  private _domRod!: HTMLDivElement;
  private _domMain!: HTMLDivElement;
  private _domImage!: HTMLDivElement;
  private _domCtrl!: HTMLDivElement;
  private _domCtrlPerson!: HTMLButtonElement;
  private _domCtrlMagic!: HTMLButtonElement;
  private _domCtrlClose!: HTMLButtonElement;
  private _customControls = new Map<
    string,
    { button: HTMLButtonElement; listener: (event: MouseEvent) => void }
  >();
  private _mountElement: HTMLElement | null = null;
  private _resizeObserver: ResizeObserver | null = null;

  /**
   * @public
   * @static
   * get data of a registered character
   */
  static getCharacter = (name: string): SakanaWidgetCharacter | null => {
    if (_characters == null) {
      _initCharacters();
    }
    const _char = _characters![name];
    return _char ? cloneDeep(_char) : null;
  };

  /**
   * @public
   * @static
   * get all registered character
   */
  static getCharacters = () => {
    if (_characters == null) {
      _initCharacters();
    }
    return cloneDeep(_characters!);
  };

  /**
   * @public
   * @static
   * registered a new character
   */
  static registerCharacter = (name: string, character: SakanaWidgetCharacter) => {
    if (_characters == null) {
      _initCharacters();
    }
    const _char = cloneDeep(character);
    // validate inertia
    let inertia = _char.initialState.i;
    inertia = Math.min(0.5, Math.max(0, inertia));
    _char.initialState.i = inertia;
    // register character
    _characters![name] = _char;
  };

  constructor(options: SakanaWidgetOptions = {}) {
    if (_characters == null) {
      _initCharacters();
    }

    this._options = cloneDeep(defaultOptions) as RequiredDeep<SakanaWidgetOptions>;
    this._options = mergeDeep(this._options, options);

    // init default character
    this.setCharacter(this._options.character);

    // init saveState options
    this._saveState = this._options.saveState;
    this._stateKey = this._options.stateKey;

    // init dom
    this._updateDom();
    this._updateSize(this._options.size);
    this._updateLimit(this._options.size);
  }

  /**
   * @private
   * calculate limit and update from size
   */
  private _updateLimit = (size: number) => {
    let maxR = size / 5;
    if (maxR < 30) {
      maxR = 30;
    } else if (maxR > 60) {
      maxR = 60;
    }
    const maxY = size / 4;
    const minY = -maxY;
    this._limit = { maxR, maxY, minY };
  };

  /**
   * @private
   * refresh widget size
   */
  private _updateSize = (size: number) => {
    this._options.size = size;
    this._imageSize = this._options.size / 1.25;

    // widget root app
    this._domApp.style.width = `${size}px`;
    this._domApp.style.height = `${size}px`;

    // widget main container
    this._domMain.style.width = `${size}px`;
    this._domMain.style.height = `${size}px`;

    // widget image
    this._domImage.style.width = `${this._imageSize}px`;
    this._domImage.style.height = `${this._imageSize}px`;
    this._domImage.style.transformOrigin = `50% ${size}px`; // use the bottom center of widget as trans origin

    this._draw(); // refresh image and rod
  };

  /**
   * @private
   * create widget dom elements
   */
  private _updateDom = () => {
    // wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'sakana-widget-wrapper';
    this._domWrapper = wrapper;

    // widget root app
    const app = document.createElement('div');
    app.className = 'sakana-widget-app';
    this._domApp = app;
    wrapper.appendChild(app);

    // decorative rod behind the image and controls
    const rod = document.createElement('div');
    rod.className = 'sakana-widget-rod';
    rod.setAttribute('aria-hidden', 'true');
    rod.style.display = this._options.rod ? '' : 'none';
    rod.style.width = `${this._options.stroke.width}px`;
    rod.style.backgroundColor = this._options.stroke.color;
    this._domRod = rod;
    app.appendChild(rod);

    // widget main container
    const main = document.createElement('div');
    main.className = 'sakana-widget-main';
    this._domMain = main;
    app.appendChild(main);

    // widget image
    const img = document.createElement('div');
    img.className = 'sakana-widget-img';
    img.style.backgroundImage = `url('${this._image}')`;
    img.style.backgroundSize = this._options.imageFit;
    if (this._options.draggable) img.style.touchAction = 'none';
    this._domImage = img;
    main.appendChild(img);

    // control bar
    const ctrl = document.createElement('div');
    ctrl.className = 'sakana-widget-ctrl';
    this._domCtrl = ctrl;
    if (this._options.controls) {
      main.appendChild(ctrl);
    }
    const itemClass = 'sakana-widget-ctrl-item';
    const person = document.createElement('button');
    person.className = itemClass;
    person.type = 'button';
    person.innerHTML = svgPerson;
    person.setAttribute('aria-label', 'Next Character');
    if (this._options.title) {
      person.title = 'Next Character';
    }
    this._domCtrlPerson = person;
    ctrl.appendChild(person);
    const magic = document.createElement('button');
    magic.className = itemClass;
    magic.type = 'button';
    magic.innerHTML = svgSync;
    magic.setAttribute('aria-label', 'Auto Mode');
    magic.setAttribute('aria-pressed', 'false');
    if (this._options.title) {
      magic.title = 'Auto Mode';
    }
    this._domCtrlMagic = magic;
    ctrl.appendChild(magic);
    const github = document.createElement('a');
    github.className = itemClass;
    github.href = '//github.com/dsrkafuu/sakana-widget';
    github.target = '_blank';
    github.rel = 'noopener noreferrer';
    github.innerHTML = svgGitHub;
    github.setAttribute('aria-label', 'GitHub Repository');
    if (this._options.title) {
      github.title = 'GitHub Repository';
    }
    ctrl.appendChild(github);
    const close = document.createElement('button');
    close.className = itemClass;
    close.type = 'button';
    close.innerHTML = svgClose;
    close.setAttribute('aria-label', 'Close');
    if (this._options.title) {
      close.title = 'Close';
    }
    this._domCtrlClose = close;
    ctrl.appendChild(close);
  };

  /**
   * @private
   * calculate center of the image
   */
  private _calcCenterPoint = (degree: number, radius: number, x: number, y: number) => {
    const radian = (Math.PI / 180) * degree;
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);
    const nx = sin * radius + cos * x - sin * y;
    const ny = cos * radius - cos * y - sin * x;
    return { nx, ny };
  };

  /**
   * @private
   * draw a frame
   */
  private _draw = () => {
    const { r, y } = this._state;
    const { size, controls, stroke } = this._options;
    const img = this._domImage;
    const imgSize = this._imageSize;

    // move the image
    const x = r * 1;
    img.style.transform = `rotate(${r}deg) translateX(${x}px) translateY(${y}px)`;

    if (!this._options.rod) return;

    // The rod starts at the same offset from the widget's bottom as the old line.
    const startY = controls ? 10 : -10;
    const radius = size - imgSize / 2;
    const { nx, ny } = this._calcCenterPoint(r, radius, x, y);
    const deltaY = ny - startY;
    const length = Math.hypot(nx, deltaY);
    const halfWidth = stroke.width / 2;
    const rod = this._domRod;
    rod.style.bottom = `${startY - halfWidth}px`;
    rod.style.height = `${length + stroke.width}px`;
    rod.style.transformOrigin = `50% calc(100% - ${halfWidth}px)`;
    rod.style.transform = `translateX(-50%) rotate(${Math.atan2(nx, deltaY)}rad)`;
  };

  private _scheduleFrame = () => {
    if (
      !this._mounted ||
      this._hidden ||
      this._dragging ||
      !this._running ||
      this._frameRequestId !== null
    ) {
      return;
    }
    this._frameRequestId = requestAnimationFrame(this._run);
  };

  private _startAnimation = () => {
    if (!this._running) this._lastFrameTime = null;
    this._running = true;
    this._scheduleFrame();
  };

  private _stopAnimation = () => {
    this._running = false;
    this._lastFrameTime = null;
    if (this._frameRequestId !== null) {
      cancelAnimationFrame(this._frameRequestId);
      this._frameRequestId = null;
    }
  };

  /**
   * @private
   * run the widget in animation frame
   */
  private _run = (time: number) => {
    this._frameRequestId = null;
    if (!this._running || !this._mounted || this._hidden || this._dragging) return;

    let originRotate = this._options.rotate;
    originRotate = Math.min(120, Math.max(0, originRotate));
    const cut = this._options.threshold;
    let { r, y, t, w } = this._state;
    const { d, i } = this._state;
    const frameStep =
      this._lastFrameTime === null
        ? 1
        : Math.min(2, Math.max(0, (time - this._lastFrameTime) / (1000 / 60)));
    this._lastFrameTime = time;

    w -= (r * 2 + originRotate) * frameStep;
    r += w * i * 1.2 * frameStep;
    this._state.w = w * d ** frameStep;
    this._state.r = r;
    t -= y * 2 * frameStep;
    y += t * i * 2 * frameStep;
    this._state.t = t * d ** frameStep;
    this._state.y = y;

    this._draw();

    // stop if motion is too little
    if (
      Math.max(
        Math.abs(this._state.w),
        Math.abs(this._state.r + originRotate / 2),
        Math.abs(this._state.t),
        Math.abs(this._state.y),
      ) < cut
    ) {
      this._stopAnimation();
      return;
    }
    this._scheduleFrame();
  };

  /**
   * @private
   * manually move the widget
   */
  private _move = (x: number, y: number) => {
    const { maxR, maxY, minY } = this._limit;
    let r = x * this._state.s;
    r = Math.max(-maxR, r);
    r = Math.min(maxR, r);
    y = y * this._state.s * 2;
    y = Math.max(minY, y);
    y = Math.min(maxY, y);
    this._state.r = r;
    this._state.y = y;
    this._state.w = 0;
    this._state.t = 0;
    this._draw();
  };

  /**
   * @private
   * handle mouse down event
   */
  private _onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0 || this._dragging) return;
    e.preventDefault();
    this._stopAnimation();
    this._dragging = true;
    const downClientY = e.clientY;
    this._state.w = 0;
    this._state.t = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = this._domMain.getBoundingClientRect();
      const leftCenter = rect.left + rect.width / 2;
      const x = e.clientX - leftCenter;
      const y = e.clientY - downClientY;
      this._move(x, y);
    };

    const onMouseUp = () => {
      this._stopDrag?.();
      this._startAnimation();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onMouseUp);
    this._stopDrag = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', onMouseUp);
      this._stopDrag = null;
      this._dragging = false;
    };
  };

  /**
   * @private
   * handle touch start event
   */
  private _onTouchStart = (e: TouchEvent) => {
    if (this._dragging || !e.touches[0]) return;
    e.preventDefault();
    this._stopAnimation();
    this._dragging = true;
    const { clientY: downClientY, identifier } = e.touches[0];
    this._state.w = 0;
    this._state.t = 0;

    const onTouchMove = (e: TouchEvent) => {
      const touch = Array.from(e.touches).find((item) => item.identifier === identifier);
      if (!touch) return;
      e.preventDefault();
      const rect = this._domMain.getBoundingClientRect();
      const leftCenter = rect.left + rect.width / 2;
      const x = touch.clientX - leftCenter;
      const y = touch.clientY - downClientY;
      this._move(x, y);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!Array.from(e.changedTouches).some((item) => item.identifier === identifier)) return;
      this._stopDrag?.();
      this._startAnimation();
    };

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchEnd);
    this._stopDrag = () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchEnd);
      this._stopDrag = null;
      this._dragging = false;
    };
  };

  /**
   * @private
   * do a force on widget (for auto mode)
   */
  private _magicForce = () => {
    if (!this._mounted || this._hidden || !this._magicForceEnabled) return;
    // 0.1 probability to randomly switch character
    if (Math.random() < 0.1) {
      const available = Object.keys(_characters!);
      const index = Math.floor(Math.random() * available.length);
      const _char = available[index];
      if (_char) {
        this.setCharacter(_char);
      }
    } else {
      // add random velocities in the vertical and horizontal directions
      this._state.t = this._state.t + (Math.random() - 0.5) * 150;
      this._state.w = this._state.w + (Math.random() - 0.5) * 200;
    }

    this._startAnimation();
    // set a variable delay between applying magic powers
    this._magicForceTimeout = window.setTimeout(this._magicForce, Math.random() * 3000 + 2000);
  };

  /**
   * @public
   * switch the auto mode
   */
  private _setAutoMode = (enabled: boolean) => {
    this._magicForceEnabled = enabled;
    const icon = this._domCtrlMagic.querySelector('svg');
    icon?.classList.toggle('sakana-widget-icon--rotate', enabled);
    this._domCtrlMagic.setAttribute('aria-pressed', String(enabled));
    clearTimeout(this._magicForceTimeout);
    if (enabled && this._mounted && !this._hidden) {
      this._magicForceTimeout = window.setTimeout(this._magicForce, Math.random() * 1000 + 500);
    }
  };

  triggerAutoMode = () => {
    this._setAutoMode(!this._magicForceEnabled);
  };

  /**
   * @public
   * set current state of widget
   */
  setState = (state: Partial<SakanaWidgetState>) => {
    if (!this._state) {
      this._state = {} as SakanaWidgetState;
    }
    this._state = mergeDeep(this._state, cloneDeep(state));
    if (this._domImage) {
      this._draw();
      if (this._mounted && !this._hidden && !this._dragging) this._startAnimation();
    }
    return this;
  };

  /**
   * @public
   * set current character of widget
   */
  setCharacter = (name: string) => {
    const targetChar = _characters![name];
    if (!targetChar) {
      throw new Error(`invalid character ${name}`);
    }
    this._char = name;
    this._image = targetChar.image;
    if (this._domImage) {
      this._domImage.style.backgroundImage = `url('${this._image}')`;
    }
    this.setState(targetChar.initialState);
    return this;
  };

  /**
   * @public
   * set to next character of widget
   */
  nextCharacter = () => {
    const _chars = Object.keys(_characters!).sort();
    const curCharIdx = _chars.indexOf(this._char);
    const nextCharIdx = (curCharIdx + 1) % _chars.length;
    const nextChar = _chars[nextCharIdx];
    if (nextChar) {
      this.setCharacter(nextChar);
    }
    return this;
  };

  /**
   * @public
   * add a custom control to this widget's control bar
   */
  addControl = (control: SakanaWidgetControl) => {
    if (!control.id.trim() || !control.label.trim()) {
      throw new Error('Control id and label must not be empty');
    }
    if (!control.icon || control.icon.nodeType !== 1) {
      throw new Error('Control icon must be a DOM element');
    }
    if (this._customControls.has(control.id)) {
      throw new Error(`Control ${control.id} is already registered`);
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'sakana-widget-ctrl-item sakana-widget-ctrl-item--custom';
    button.dataset.sakanaControl = control.id;
    button.setAttribute('aria-label', control.label);
    if (this._options.title) button.title = control.label;
    const icon = control.icon.cloneNode(true) as Element;
    icon.setAttribute('aria-hidden', 'true');
    button.appendChild(icon);

    const listener = (event: MouseEvent) => control.onClick(this, event);
    this._domCtrl.insertBefore(button, this._domCtrlClose);
    if (this._mounted) button.addEventListener('click', listener);
    this._customControls.set(control.id, { button, listener });
    return this;
  };

  /**
   * @public
   * remove a previously added custom control
   */
  removeControl = (id: string) => {
    const control = this._customControls.get(id);
    if (control) {
      control.button.removeEventListener('click', control.listener);
      control.button.remove();
      this._customControls.delete(id);
    }
    return this;
  };

  /**
   * @private
   * control widget visibility and persist state
   */
  private _saveHiddenState = (hidden: boolean) => {
    try {
      localStorage.setItem(this._stateKey, hidden ? 'hide' : 'show');
    } catch {
      // Ignore storage failures in privacy-restricted browsing contexts.
    }
  };

  private _getSavedHiddenState = () => {
    try {
      return localStorage.getItem(this._stateKey) === 'hide';
    } catch {
      return false;
    }
  };

  private _setHidden = (hidden: boolean, persist = true, notify = true) => {
    this._hidden = hidden;
    this._domWrapper.style.display = hidden ? 'none' : '';

    if (notify) {
      const state: SakanaWidgetVisibility = hidden ? 'hide' : 'show';
      for (const listener of this._stateListeners) {
        listener(state);
      }
    }

    if (hidden) {
      this._stopDrag?.();
      this._stopAnimation();
      this._setAutoMode(false);
    } else {
      this._startAnimation();
    }

    if (this._saveState && persist) {
      this._saveHiddenState(hidden);
    }
  };

  /**
   * @public
   * hide the widget (stops animation, persists state if saveState is enabled)
   */
  hide = () => {
    if (!this._hidden) {
      this._setHidden(true);
    }
    return this;
  };

  /**
   * @public
   * show the widget if previously hidden
   */
  show = () => {
    if (this._hidden) {
      this._setHidden(false);
    } else {
      console.warn('[sakana-widget] show() called but widget is not hidden');
    }
    return this;
  };

  /**
   * @public
   * add a listener for widget visibility changes
   */
  addStateListener = (listener: (state: SakanaWidgetVisibility) => void) => {
    this._stateListeners.push(listener);
    return this;
  };

  /**
   * @public
   * remove a previously added state listener
   */
  removeStateListener = (listener: (state: SakanaWidgetVisibility) => void) => {
    const idx = this._stateListeners.indexOf(listener);
    if (idx !== -1) {
      this._stateListeners.splice(idx, 1);
    }
    return this;
  };

  /**
   * @private
   * handle widget resize
   */
  private _onResize = (rect: DOMRect) => {
    let newSize = Math.min(rect.width, rect.height);
    newSize = Math.max(120, newSize); // at least 120
    this._updateSize(newSize);
    this._updateLimit(newSize);
  };

  /**
   * @public
   * mount the widget
   */
  mount = (el: HTMLElement | string) => {
    // pre check
    let _el: HTMLElement | null;
    if (typeof el === 'string') {
      _el = document.querySelector(el);
    } else {
      _el = el;
    }
    if (!_el) {
      throw new Error('Invalid mounting element');
    }
    if (this._mounted) throw new Error('Widget is already mounted');

    // append event listeners
    if (this._options.draggable) {
      this._domImage.addEventListener('mousedown', this._onMouseDown);
      this._domImage.addEventListener('touchstart', this._onTouchStart);
    }

    this._domCtrlPerson.addEventListener('click', this.nextCharacter);
    this._domCtrlMagic.addEventListener('click', this.triggerAutoMode);
    for (const { button, listener } of this._customControls.values()) {
      button.addEventListener('click', listener);
    }
    if (this._saveState) {
      this._domCtrlClose.addEventListener('click', this.hide);
    } else {
      this._domCtrlClose.addEventListener('click', this.unmount);
    }

    // keep the host element and its existing children and listeners
    _el.appendChild(this._domWrapper);
    this._mountElement = _el;
    this._mounted = true;
    this._hidden = false;
    this._domWrapper.style.display = '';

    // if auto fit mode
    if (this._options.autoFit) {
      // measure after the wrapper is attached to its host
      this._onResize(this._domWrapper.getBoundingClientRect());
      // handle future resize
      this._resizeObserver = new ResizeObserver(
        throttle((entries) => {
          if (!entries || !entries[0]) return;
          this._onResize(entries[0].contentRect);
        }),
      );
      this._resizeObserver.observe(this._domWrapper);
    }

    // restore persisted hide state
    if (this._saveState && this._getSavedHiddenState()) {
      this._setHidden(true, false, false);
    } else {
      this._startAnimation();
      if (this._magicForceEnabled) this._setAutoMode(true);
    }

    // notify initial state
    const mountState: SakanaWidgetVisibility = this._hidden ? 'hide' : 'show';
    for (const listener of this._stateListeners) {
      listener(mountState);
    }
    return this;
  };

  /**
   * @public
   * unmount the widget
   */
  unmount = () => {
    // stop animation and auto mode
    this._stopDrag?.();
    this._stopAnimation();
    this._setAutoMode(false);

    // remove event listeners
    this._domImage.removeEventListener('mousedown', this._onMouseDown);
    this._domImage.removeEventListener('touchstart', this._onTouchStart);
    this._domCtrlPerson.removeEventListener('click', this.nextCharacter);
    this._domCtrlMagic.removeEventListener('click', this.triggerAutoMode);
    for (const { button, listener } of this._customControls.values()) {
      button.removeEventListener('click', listener);
    }
    if (this._saveState) {
      this._domCtrlClose.removeEventListener('click', this.hide);
    } else {
      this._domCtrlClose.removeEventListener('click', this.unmount);
    }

    // if auto fit mode
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }

    // unmount node
    if (!this._mountElement) {
      throw new Error('Invalid mounting element');
    }
    this._mountElement.removeChild(this._domWrapper);
    this._mountElement = null;
    this._mounted = false;
    return this;
  };
}

export default SakanaWidget;
export type {
  SakanaWidgetCharacter,
  SakanaWidgetState,
  SakanaWidgetOptions,
  SakanaWidgetControl,
  SakanaWidgetVisibility,
};
