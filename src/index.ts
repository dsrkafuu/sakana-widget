/*! sakana-widget | DSRKafuU (https://dsrkafuu.net) | Copyright (c) MIT License */

import './index.scss';
import type { RequiredDeep } from './utils';
import type { SakanaWidgetCharacter, SakanaWidgetState } from './characters';
import { ResizeObserver } from '@juggle/resize-observer';
import characters from './characters';
import { svgClose, svgGitHub, svgPerson, svgSync } from './icons';
import { cloneDeep, mergeDeep, throttle, getCanvasCtx } from './utils';

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
   * controls bar, default to `true`
   */
  controls?: boolean;
  /**
   * canvas stroke settings, default to `#b4b4b4` & `10`
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
   * show spring rod
   */
  showRod?: boolean;
}
const defaultOptions: SakanaWidgetOptions = {
  size: 200,
  autoFit: false,
  character: 'chisato',
  controls: true,
  stroke: {
    color: '#b4b4b4',
    width: 10,
  },
  threshold: 0.1,
  rotate: 0,
  showRod: true
};

// register default characters
let _characters: { [key: string]: SakanaWidgetCharacter } = null as any;
function _initCharacters() {
  if (_characters) return;
  _characters = {};
  (Object.keys(characters) as Array<keyof typeof characters>).forEach((key) => {
    const _char = characters[key];
    _characters[key] = cloneDeep(_char);
  });
}

/**
 * widget instance class
 */
class SakanaWidget {
  private _options: RequiredDeep<SakanaWidgetOptions>;

  // app metadata
  private _imageSize!: number;
  private _canvasSize!: number;
  private _limit!: { maxR: number; maxY: number; minY: number };
  private _lastRunUnix = Date.now();
  private _frameUnix = 1000 / 60; // default to speed of 60 fps
  private _running = true;
  private _magicForceTimeout = 0;
  private _magicForceEnabled = false;

  // character related
  private _char!: string;
  private _image!: string;
  private _state!: SakanaWidgetState;

  // dom element related
  private _domWrapper!: HTMLDivElement; // this is needed for resize observer
  private _domApp!: HTMLDivElement; // actual app element
  private _domCanvas!: HTMLCanvasElement;
  private _domCanvasCtx!: CanvasRenderingContext2D;
  private _domMain!: HTMLDivElement;
  private _domImage!: HTMLDivElement;
  private _domCtrlPerson!: HTMLDivElement;
  private _domCtrlMagic!: HTMLDivElement;
  private _domCtrlClose!: HTMLDivElement;
  private _resizeObserver: ResizeObserver | null = null;

  /**
   * @public
   * @static
   * get data of a registered character
   */
  static getCharacter = (name: string): SakanaWidgetCharacter | null => {
    if (_characters == null) {
      _initCharacters()
    }
    const _char = _characters[name];
    return _char ? cloneDeep(_char) : null;
  };

  /**
   * @public
   * @static
   * get all registered character
   */
  static getCharacters = () => {
    if (_characters == null) {
      _initCharacters()
    }
    return cloneDeep(_characters);
  };

  /**
   * @public
   * @static
   * registered a new character
   */
  static registerCharacter = (
    name: string,
    character: SakanaWidgetCharacter
  ) => {
    const _char = cloneDeep(character);
    // validate inertia
    let inertia = _char.initialState.i;
    inertia = Math.min(0.5, Math.max(0, inertia));
    _char.initialState.i = inertia;
    // register character
    _characters[name] = _char;
  };

  constructor(options: SakanaWidgetOptions = {}) {
    if (_characters == null) {
      _initCharacters();
    }

    this._options = cloneDeep(
      defaultOptions
    ) as RequiredDeep<SakanaWidgetOptions>;
    this._options = mergeDeep(this._options, options);

    // init default character
    this.setCharacter(this._options.character);

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
    this._canvasSize = this._options.size * 1.5;

    // widget root app
    this._domApp.style.width = `${size}px`;
    this._domApp.style.height = `${size}px`;

    // canvas stroke palette
    this._domCanvas.style.width = `${this._canvasSize}px`;
    this._domCanvas.style.height = `${this._canvasSize}px`;
    const ctx = getCanvasCtx(this._domCanvas, this._canvasSize);
    if (!ctx) {
      throw new Error('Invalid canvas context');
    }
    this._domCanvasCtx = ctx;
    this._draw(); // refresh canvas

    // widget main container
    this._domMain.style.width = `${size}px`;
    this._domMain.style.height = `${size}px`;

    // widget image
    this._domImage.style.width = `${this._imageSize}px`;
    this._domImage.style.height = `${this._imageSize}px`;
    this._domImage.style.transformOrigin = `50% ${size}px`; // use the bottom center of widget as trans origin
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

    // canvas stroke palette
    const canvas = document.createElement('canvas');
    canvas.className = 'sakana-widget-canvas';
    this._domCanvas = canvas;
    app.appendChild(canvas);

    // widget main container
    const main = document.createElement('div');
    main.className = 'sakana-widget-main';
    this._domMain = main;
    app.appendChild(main);

    // widget image
    const img = document.createElement('div');
    img.className = 'sakana-widget-img';
    img.style.backgroundImage = `url('${this._image}')`;
    this._domImage = img;
    main.appendChild(img);

    // control bar
    const ctrl = document.createElement('div');
    ctrl.className = 'sakana-widget-ctrl';
    if (this._options.controls) {
      main.appendChild(ctrl);
    }
    const itemClass = 'sakana-widget-ctrl-item';
    const person = document.createElement('div');
    person.className = itemClass;
    person.innerHTML = svgPerson;
    this._domCtrlPerson = person;
    ctrl.appendChild(person);
    const magic = document.createElement('div');
    magic.className = itemClass;
    magic.innerHTML = svgSync;
    this._domCtrlMagic = magic;
    ctrl.appendChild(magic);
    const github = document.createElement('a');
    github.className = itemClass;
    github.href = '//github.com/dsrkafuu/sakana-widget';
    github.target = '_blank';
    github.innerHTML = svgGitHub;
    ctrl.appendChild(github);
    const close = document.createElement('div');
    close.className = itemClass;
    close.innerHTML = svgClose;
    this._domCtrlClose = close;
    ctrl.appendChild(close);
  };

  /**
   * @private
   * calculate center of the image
   */
  private _calcCenterPoint = (
    degree: number,
    radius: number,
    x: number,
    y: number
  ) => {
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
    const ctx = this._domCanvasCtx;

    // move the image
    const x = r * 1;
    img.style.transform = `rotate(${r}deg) translateX(${x}px) translateY(${y}px)`;

    // draw the canvas line
    ctx.clearRect(0, 0, this._canvasSize, this._canvasSize);
    ctx.save();
    // use the bottom center of widget as axis origin
    // note that canvas is 1.5 times larger than widget
    ctx.translate(this._canvasSize / 2, size + (this._canvasSize - size) / 2);
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    if (this._options.showRod) {
      ctx.beginPath();
    }
    // use the bottom center (different offset) of widget as start of the line
    if (controls) {
      ctx.moveTo(0, -10);
    } else {
      ctx.moveTo(0, 10);
    }
    if (this._options.showRod) {
      const radius = size - imgSize / 2;
      const { nx, ny } = this._calcCenterPoint(r, radius, x, y);
      ctx.lineTo(nx, -ny);
      ctx.stroke();
    }
    ctx.restore();
  };

  /**
   * @private
   * run the widget in animation frame
   */
  private _run = () => {
    let originRotate = this._options.rotate;
    originRotate = Math.min(120, Math.max(0, originRotate));
    const cut = this._options.threshold;
    if (!this._running) {
      return;
    }
    let { r, y, t, w } = this._state;
    const { d, i } = this._state;
    const thisRunUnix = Date.now();
    let _inertia = i;

    // ignore if frame diff is above 16ms (60fps)
    const lastRunUnixDiff = thisRunUnix - this._lastRunUnix;
    if (lastRunUnixDiff < 16) {
      _inertia = (i / this._frameUnix) * lastRunUnixDiff;
    }
    this._lastRunUnix = thisRunUnix;

    w = w - r * 2 - originRotate;
    r = r + w * _inertia * 1.2;
    this._state.w = w * d;
    this._state.r = r;
    t = t - y * 2;
    y = y + t * _inertia * 2;
    this._state.t = t * d;
    this._state.y = y;

    // stop if motion is too little
    if (
      Math.max(
        Math.abs(this._state.w),
        Math.abs(this._state.r),
        Math.abs(this._state.t),
        Math.abs(this._state.y)
      ) < cut
    ) {
      this._running = false;
      return;
    }

    this._draw();
    requestAnimationFrame(this._run);
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
    e.preventDefault();
    this._running = false;
    const { pageY } = e;
    const _downPageY = pageY;
    this._state.w = 0;
    this._state.t = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = this._domMain.getBoundingClientRect();
      const leftCenter = rect.left + rect.width / 2;
      const { pageX, pageY } = e;
      const x = pageX - leftCenter;
      const y = pageY - _downPageY;
      this._move(x, y);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      this._running = true;
      requestAnimationFrame(this._run);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  /**
   * @private
   * handle touch start event
   */
  private _onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    this._running = false;
    if (!e.touches[0]) {
      return;
    }
    const { pageY } = e.touches[0];
    const _downPageY = pageY;
    this._state.w = 0;
    this._state.t = 0;

    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) {
        return;
      }
      const rect = this._domMain.getBoundingClientRect();
      const leftCenter = rect.left + rect.width / 2;
      const { pageX, pageY } = e.touches[0];
      const x = pageX - leftCenter;
      const y = pageY - _downPageY;
      this._move(x, y);
    };

    const onTouchEnd = () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      this._running = true;
      requestAnimationFrame(this._run);
    };

    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
  };

  /**
   * @private
   * do a force on widget (for auto mode)
   */
  private _magicForce = () => {
    // 0.1 probability to randomly switch character
    if (Math.random() < 0.1) {
      const available = Object.keys(_characters);
      const index = Math.floor(Math.random() * available.length);
      const _char = available[index];
      this.setCharacter(_char);
    } else {
      // add random velocities in the vertical and horizontal directions
      this._state.t = this._state.t + (Math.random() - 0.5) * 150;
      this._state.w = this._state.w + (Math.random() - 0.5) * 200;
    }

    if (!this._running) {
      this._running = true;
      requestAnimationFrame(this._run);
    }
    // set a variable delay between applying magic powers
    this._magicForceTimeout = window.setTimeout(
      this._magicForce,
      Math.random() * 3000 + 2000
    );
  };

  /**
   * @public
   * switch the auto mode
   */
  triggetAutoMode = () => {
    this._magicForceEnabled = !this._magicForceEnabled;

    // toggle icon rotate
    const icon = this._domCtrlMagic.querySelector('svg') as SVGSVGElement;
    if (this._magicForceEnabled) {
      icon.classList.add('sakana-widget-icon--rotate');
    } else {
      icon.classList.remove('sakana-widget-icon--rotate');
    }

    // clear the timer or start a timer
    clearTimeout(this._magicForceTimeout);
    if (this._magicForceEnabled) {
      this._magicForceTimeout = window.setTimeout(
        this._magicForce,
        Math.random() * 1000 + 500
      );
    }
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
    return this;
  };

  /**
   * @public
   * set current character of widget
   */
  setCharacter = (name: string) => {
    const targetChar = _characters[name];
    if (!targetChar) {
      throw new Error(`invalid character ${name}`);
    }
    this._char = name;
    this._image = targetChar.image;
    this.setState(targetChar.initialState);

    // refresh the widget image
    if (this._domImage) {
      this._domImage.style.backgroundImage = `url('${this._image}')`;
    }
    return this;
  };

  /**
   * @public
   * set to next character of widget
   */
  nextCharacter = () => {
    const _chars = Object.keys(SakanaWidget.getCharacters()).sort();
    const curCharIdx = _chars.indexOf(this._char);
    const nextCharIdx = (curCharIdx + 1) % _chars.length;
    const nextChar = _chars[nextCharIdx];
    this.setCharacter(nextChar);
    return this;
  };

  /**
   * @private
   * handle widget resize
   */
  _onResize = (rect: DOMRect) => {
    let newSize = Math.min(rect.width, rect.height);
    newSize = Math.max(120, newSize); // at least 120
    this._updateSize(newSize);
    this._updateLimit(newSize);
  };

  /**
   * @public
   * mount the widget
   */
  mount = (el: HTMLElement | string, canMove: boolean = true) => {
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
    const parent = _el.parentNode;
    if (!parent) {
      throw new Error('Invalid mounting element parent');
    }

    // append event listeners
    if (canMove) {
      this._domImage.addEventListener('mousedown', this._onMouseDown);
      this._domImage.addEventListener('touchstart', this._onTouchStart);
    }

    this._domCtrlPerson.addEventListener('click', this.nextCharacter);
    this._domCtrlMagic.addEventListener('click', this.triggetAutoMode);
    this._domCtrlClose.addEventListener('click', this.unmount);

    // if auto fit mode
    if (this._options.autoFit) {
      // initial resize
      this._onResize(this._domWrapper.getBoundingClientRect());
      // handle furture resize
      this._resizeObserver = new ResizeObserver(
        throttle((entries) => {
          if (!entries || !entries[0]) return;
          this._onResize(entries[0].contentRect);
        })
      );
      this._resizeObserver.observe(this._domWrapper);
    }

    // mount node
    const _newEl = _el.cloneNode(false) as HTMLElement;
    _newEl.appendChild(this._domWrapper);
    parent.replaceChild(_newEl, _el);
    requestAnimationFrame(this._run);
    return this;
  };

  /**
   * @public
   * unmount the widget
   */
  unmount = () => {
    // remove event listeners
    this._domImage.removeEventListener('mousedown', this._onMouseDown);
    this._domImage.removeEventListener('touchstart', this._onTouchStart);
    this._domCtrlPerson.removeEventListener('click', this.nextCharacter);
    this._domCtrlMagic.removeEventListener('click', this.triggetAutoMode);
    this._domCtrlClose.removeEventListener('click', this.unmount);

    // if auto fit mode
    this._resizeObserver && this._resizeObserver.disconnect();

    // unmount node
    const _el = this._domWrapper.parentNode;
    if (!_el) {
      throw new Error('Invalid mounting element');
    }
    _el.removeChild(this._domWrapper);
    return this;
  };
}

export default SakanaWidget;
export type { SakanaWidgetCharacter, SakanaWidgetState, SakanaWidgetOptions };
