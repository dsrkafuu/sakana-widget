import './index.scss';
import { cloneDeep, merge as mergeDeep } from 'lodash-es';
import characters, {
  SakanaWidgetCharacter,
  SakanaWidgetState,
} from './characters';
import { svgClose, svgGitHub, svgPerson, svgSync } from './icons';
import { getCanvasCtx } from './utils';

export interface SakanaWidgetOptions {
  /**
   * widget size, default to `200`
   */
  size?: number;
  /**
   * default character, default to `chisato`
   */
  character?: 'chisato' | 'takina';
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
}
const defaultOptions: SakanaWidgetOptions = {
  size: 200,
  character: 'chisato',
  controls: true,
  stroke: {
    color: '#b4b4b4',
    width: 10,
  },
};

// register default characters
const _characters: { [key: string]: SakanaWidgetCharacter } = {};
(Object.keys(characters) as Array<keyof typeof characters>).forEach((key) => {
  const _char = characters[key];
  _characters[key] = cloneDeep(_char);
});

/**
 * widget instance class
 */
class SakanaWidget {
  _options: RequiredDeep<SakanaWidgetOptions>;

  // app metadata
  _imageSize: number;
  _limit!: { maxR: number; maxY: number; minY: number };
  _lastRunUnix = Date.now();
  _frameUnix = 1000 / 60; // default to speed of 60 fps
  _running = true;
  _magicForceTimeout = 0;
  _magicForceEnabled = false;

  // character related
  _image!: string;
  _state!: SakanaWidgetState;

  // dom element related
  _domApp!: HTMLDivElement;
  _domCanvas!: HTMLCanvasElement;
  _domCanvasCtx!: CanvasRenderingContext2D;
  _domMain!: HTMLDivElement;
  _domImage!: HTMLDivElement;
  _domCtrl!: HTMLDivElement;
  _domCtrlPerson!: HTMLDivElement;
  _domCtrlMagic!: HTMLDivElement;
  _domCtrlGitHub!: HTMLAnchorElement;
  _domCtrlClose!: HTMLDivElement;

  /**
   * @public
   * @static
   * get data of a registered character
   */
  static getCharacter(name: string): SakanaWidgetCharacter | null {
    return _characters[name] || null;
  }

  /**
   * @public
   * @static
   * get all registered character
   */
  static getCharacters() {
    return _characters;
  }

  /**
   * @public
   * @static
   * registered a new character
   */
  static registerCharacter(name: string, character: SakanaWidgetCharacter) {
    _characters[name] = cloneDeep(character);
  }

  constructor(options: SakanaWidgetOptions = {}) {
    this._options = cloneDeep(
      defaultOptions
    ) as RequiredDeep<SakanaWidgetOptions>;
    mergeDeep(this._options, options);

    // init app metadata
    this._imageSize = this._options.size / 1.25;
    this._updateLimit(this._options.size);

    // init default character
    this.setCharacter(this._options.character);

    // init dom
    this._updateDom();

    // bind callbacks
    this._updateLimit = this._updateLimit.bind(this);
    this._updateDom = this._updateDom.bind(this);
    this._calcCenterPoint = this._calcCenterPoint.bind(this);
    this._draw = this._draw.bind(this);
    this._run = this._run.bind(this);
    this._move = this._move.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._magicForce = this._magicForce.bind(this);
    this.setState = this.setState.bind(this);
    this.setCharacter = this.setCharacter.bind(this);
    this.triggetAutoMode = this.triggetAutoMode.bind(this);
    this.mount = this.mount.bind(this);
    this.unmount = this.unmount.bind(this);
  }

  /**
   * @private
   * calculate limit and update from size
   */
  _updateLimit(size: number) {
    let maxR = size / 5;
    if (maxR < 30) {
      maxR = 30;
    } else if (maxR > 60) {
      maxR = 60;
    }
    const maxY = size / 4;
    const minY = -maxY;
    this._limit = { maxR, maxY, minY };
  }

  /**
   * @private
   * create widget dom elements
   */
  _updateDom() {
    const { size, controls } = this._options;
    const imageSize = this._imageSize;

    // widget root app
    const app = document.createElement('div');
    app.className = 'sakana-widget-app';
    app.style.width = `${size}px`;
    app.style.height = `${size}px`;
    this._domApp = app;

    // canvas stroke palette
    const canvas = document.createElement('canvas');
    canvas.className = 'sakana-widget-canvas';
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const ctx = getCanvasCtx(canvas, size);
    if (!ctx) {
      throw new Error('Invalid canvas context');
    }
    app.appendChild(canvas);
    this._domCanvas = canvas;
    this._domCanvasCtx = ctx;

    // widget main container
    const main = document.createElement('div');
    main.className = 'sakana-widget-main';
    main.style.width = `${size}px`;
    main.style.height = `${size}px`;
    app.appendChild(main);
    this._domMain = main;

    // widget image
    const img = document.createElement('div');
    img.className = 'sakana-widget-img';
    img.style.width = `${imageSize}px`;
    img.style.height = `${imageSize}px`;
    img.style.transformOrigin = `50% ${size}px`; // use the bottom center of widget as trans origin
    img.style.backgroundImage = `url('${this._image}')`;
    main.appendChild(img);
    this._domImage = img;

    // control bar
    const ctrl = document.createElement('div');
    ctrl.className = 'sakana-widget-ctrl';
    if (controls) {
      main.appendChild(ctrl);
    }
    this._domCtrl = ctrl;
    const itemClass = 'sakana-widget-ctrl-item';
    const person = document.createElement('div');
    person.className = itemClass;
    person.innerHTML = svgPerson;
    ctrl.appendChild(person);
    this._domCtrlPerson = person;
    const magic = document.createElement('div');
    magic.className = itemClass;
    magic.innerHTML = svgSync;
    ctrl.appendChild(magic);
    this._domCtrlMagic = magic;
    const github = document.createElement('a');
    github.className = itemClass;
    github.href = '//github.com/dsrkafuu/sakana-widget';
    github.target = '_blank';
    github.innerHTML = svgGitHub;
    ctrl.appendChild(github);
    this._domCtrlGitHub = github;
    const close = document.createElement('div');
    close.className = itemClass;
    close.innerHTML = svgClose;
    ctrl.appendChild(close);
    this._domCtrlClose = close;
  }

  /**
   * @private
   * calculate center of the image
   */
  _calcCenterPoint(degree: number, radius: number, x: number, y: number) {
    const radian = (Math.PI / 180) * degree;
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);
    const nx = sin * radius + cos * x - sin * y;
    const ny = cos * radius - cos * y - sin * x;
    return { nx, ny };
  }

  /**
   * @private
   * draw a frame
   */
  _draw() {
    const { r, y } = this._state;
    const { size, controls, stroke } = this._options;
    const img = this._domImage;
    const imgSize = this._imageSize;
    const ctx = this._domCanvasCtx;

    // move the image
    const x = r * 1;
    img.style.transform = `rotate(${r}deg) translateX(${x}px) translateY(${y}px)`;

    // draw the canvas line
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size); // use the bottom center of widget as axis origin
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // use the bottom center (different offset) of widget as start of the line
    if (controls) {
      ctx.moveTo(0, -10);
    } else {
      ctx.moveTo(0, 10);
    }
    const radius = size - imgSize / 2;
    const { nx, ny } = this._calcCenterPoint(r, radius, x, y);
    ctx.lineTo(nx, -ny);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * @private
   * run the widget in animation frame
   */
  _run() {
    const originRotate = 0;
    const cut = 0.1;
    if (!this._running) {
      return;
    }
    let { r, y, t, w } = this._state;
    const { d, i } = this._state;

    const thisRunUnix = Date.now();
    const lastRunUnixDiff = thisRunUnix - this._lastRunUnix;
    let _inertia = i;
    // ignore if frame diff is above 40ms (25fps)
    if (lastRunUnixDiff < 40) {
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
  }

  /**
   * @private
   * manually move the widget
   */
  _move(x: number, y: number) {
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
  }

  /**
   * @private
   * handle mouse down event
   */
  _onMouseDown(e: MouseEvent) {
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
  }

  /**
   * @private
   * handle touch start event
   */
  _onTouchStart(e: TouchEvent) {
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
  }

  /**
   * @private
   * do a force on widget (for auto mode)
   */
  _magicForce() {
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
  }

  /**
   * @public
   * set current state of widget
   */
  setState(state: Partial<SakanaWidgetState>) {
    if (!this._state) {
      this._state = {} as SakanaWidgetState;
    }
    mergeDeep(this._state, cloneDeep(state));
    return this;
  }

  /**
   * @public
   * set current character of widget
   */
  setCharacter(name: string) {
    const targetChar = _characters[name];
    if (!targetChar) {
      throw new Error(`invalid character ${name}`);
    }
    this._image = targetChar.image;
    this.setState(targetChar.initialState);

    // refresh the widget image
    if (this._domImage) {
      this._domImage.style.backgroundImage = `url('${this._image}')`;
    }
    return this;
  }

  /**
   * @public
   * switch the auto mode
   */
  triggetAutoMode() {
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
  }

  /**
   * @public
   * mount the widget, default to `#sakana-widget`
   */
  mount(el: HTMLElement | string) {
    // pre check
    let _el: HTMLElement | null = null;
    if (typeof el === 'string') {
      _el = document.querySelector(el);
    }
    if (!_el) {
      throw new Error('Invalid mounting element');
    }
    const parent = _el.parentNode;
    if (!parent) {
      throw new Error('Invalid mounting element parent');
    }

    // append event listeners
    this._domImage.addEventListener('mousedown', this._onMouseDown);
    this._domImage.addEventListener('touchstart', this._onTouchStart);
    this._domCtrlMagic.addEventListener('click', this.triggetAutoMode);

    // mount node
    const _newEl = _el.cloneNode(false) as HTMLElement;
    _newEl.appendChild(this._domApp);
    parent.replaceChild(_newEl, _el);
    requestAnimationFrame(this._run);
    return this;
  }

  /**
   * @public
   * unmount the widget
   */
  unmount() {
    // remove event listeners
    this._domImage.removeEventListener('mousedown', this._onMouseDown);
    this._domImage.removeEventListener('touchstart', this._onTouchStart);
    this._domCtrlMagic.removeEventListener('click', this.triggetAutoMode);

    // unmount node
    const _el = this._domApp.parentNode;
    if (!_el) {
      throw new Error('Invalid mounting element');
    }
    _el.removeChild(this._domApp);
    return this;
  }
}

export default SakanaWidget;
