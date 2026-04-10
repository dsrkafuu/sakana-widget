/*! sakana-widget | DSRKafuU (https://dsrkafuu.net) | Copyright (c) MIT License */

import './index.scss';
import { ResizeObserver } from '@juggle/resize-observer';
import { svgClose, svgGitHub, svgPerson, svgSync } from './icons';
import {  throttle, getCanvasCtx, getDefaultOptions } from './utils';
import type { SakanaWidgetCharacter, SakanaWidgetOptions, SakanaWidgetState } from './types';

class SakanaWidgetRegistry {
  characters: Record<string, SakanaWidgetCharacter> = {}

  /**
   * get data of a registered character
   */
   getCharacter = (name: string): SakanaWidgetCharacter | null => {
    const char = this.characters[name];
    return char;
  };

  /**
   * get all registered character
   */
   getCharacters = () => {
    return (Object.values(this.characters));
  };

  /**
   * registered a new character
   */
   registerCharacter = (
    name: string,
    character: SakanaWidgetCharacter
  ) => {
    // validate inertia
    const i =character.initialState.i
    if (i < 0 || i > 0.5){
    throw new Error(`Invalid inertia: expected 0 ~ 0.5, but got ${i} for ${name}`)}

    this.characters[name] = character;
  };
}

const registry = new SakanaWidgetRegistry()


/**
 * widget instance class
 */
class SakanaWidget {
  private options: SakanaWidgetOptions;

  // app metadata
  private imageSize!: number;
  private canvasSize!: number;
  private limit!: { maxR: number; maxY: number; minY: number };
  private lastRunTimestamp = Date.now();
  private frameIntervalMs = 1000 / 60; // default to speed of 60 fps
  private running = true;
  private magicForceTimeout = 0;
  private magicForceEnabled = false;

  // character related
  private currentCharacter!: SakanaWidgetCharacter
  private char!: string;
  private state!: SakanaWidgetState;

  // dom element related
  private domWrapper!: HTMLDivElement; // this is needed for resize observer
  private domApp!: HTMLDivElement; // actual app element
  private domCanvas!: HTMLCanvasElement;
  private domCanvasCtx!: CanvasRenderingContext2D;
  private domMain!: HTMLDivElement;
  private domImage!: HTMLDivElement;
  private domCtrlPerson!: HTMLDivElement;
  private domCtrlMagic!: HTMLDivElement;
  private domCtrlClose!: HTMLDivElement;
  private resizeObserver: ResizeObserver | null = null;

  constructor(options: Partial<SakanaWidgetOptions>, character: string) {
    this.options = {...getDefaultOptions(), ...options}

    // init default character
    this.setCharacter(character);

    // init dom
    this.updateDom();
    this.updateSize(this.options.size);
    this.updateLimit(this.options.size);
  }

  /**
   * calculate limit and update from size
   */
  private updateLimit = (size: number) => {
    let maxR = size / 5;
    if (maxR < 30) {
      maxR = 30;
    } else if (maxR > 60) {
      maxR = 60;
    }
    const maxY = size / 4;
    const minY = -maxY;
    this.limit = { maxR, maxY, minY };
  };

  /**
   * refresh widget size
   */
  private updateSize = (size: number) => {
    this.options.size = size;
    this.imageSize = this.options.size / 1.25;
    this.canvasSize = this.options.size * 1.5;

    // widget root app
    this.domApp.style.width = `${size}px`;
    this.domApp.style.height = `${size}px`;

    // canvas stroke palette
    this.domCanvas.style.width = `${this.canvasSize}px`;
    this.domCanvas.style.height = `${this.canvasSize}px`;
    const ctx = getCanvasCtx(this.domCanvas, this.canvasSize);
    if (!ctx) {
      throw new Error('Invalid canvas context');
    }
    this.domCanvasCtx = ctx;
    this.draw(); // refresh canvas

    // widget main container
    this.domMain.style.width = `${size}px`;
    this.domMain.style.height = `${size}px`;

    // widget image
    this.domImage.style.width = `${this.imageSize}px`;
    this.domImage.style.height = `${this.imageSize}px`;
    this.domImage.style.transformOrigin = `50% ${size}px`; // use the bottom center of widget as trans origin
  };

  /**
   * create widget dom elements
   */
  private updateDom = () => {
    // wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'sakana-widget-wrapper';
    this.domWrapper = wrapper;

    // widget root app
    const app = document.createElement('div');
    app.className = 'sakana-widget-app';
    this.domApp = app;
    wrapper.appendChild(app);

    // canvas stroke palette
    const canvas = document.createElement('canvas');
    canvas.className = 'sakana-widget-canvas';
    this.domCanvas = canvas;
    app.appendChild(canvas);

    // widget main container
    const main = document.createElement('div');
    main.className = 'sakana-widget-main';
    this.domMain = main;
    app.appendChild(main);

    // widget image
    const img = document.createElement('div');
    img.className = 'sakana-widget-img';
    img.style.backgroundImage = `url('${this.currentCharacter.image}')`;
    this.domImage = img;
    main.appendChild(img);

    // control bar
    const ctrl = document.createElement('div');
    ctrl.className = 'sakana-widget-ctrl';
    if (this.options.controls) {
      main.appendChild(ctrl);
    }
    const itemClass = 'sakana-widget-ctrl-item';
    const person = document.createElement('div');
    person.className = itemClass;
    person.innerHTML = svgPerson;
    person.role = 'button';
    person.tabIndex = 0;
    if (this.options.title) {
      person.title = 'Next Character';
    }
    this.domCtrlPerson = person;
    ctrl.appendChild(person);
    const magic = document.createElement('div');
    magic.className = itemClass;
    magic.innerHTML = svgSync;
    magic.role = 'button';
    magic.tabIndex = 0;
    if (this.options.title) {
      magic.title = 'Auto Mode';
    }
    this.domCtrlMagic = magic;
    ctrl.appendChild(magic);
    const github = document.createElement('a');
    github.className = itemClass;
    github.href = '//github.com/dsrkafuu/sakana-widget';
    github.target = '_blank';
    github.innerHTML = svgGitHub;
    if (this.options.title) {
      github.title = 'GitHub Repository';
    }
    ctrl.appendChild(github);
    const close = document.createElement('div');
    close.className = itemClass;
    close.innerHTML = svgClose;
    close.role = 'button';
    close.tabIndex = 0;
    if (this.options.title) {
      close.title = 'Close';
    }
    this.domCtrlClose = close;
    ctrl.appendChild(close);
  };

  /**
   * calculate center of the image
   */
  private calcCenterPoint = (
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
   * draw a frame
   */
  private draw = () => {
    const { r, y } = this.state;
    const { size, controls, stroke } = this.options;
    const img = this.domImage;
    const imgSize = this.imageSize;
    const ctx = this.domCanvasCtx;

    // move the image
    const x = r * 1;
    img.style.transform = `rotate(${r}deg) translateX(${x}px) translateY(${y}px)`;

    // draw the canvas line
    ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
    ctx.save();
    // use the bottom center of widget as axis origin
    // note that canvas is 1.5 times larger than widget
    ctx.translate(this.canvasSize / 2, size + (this.canvasSize - size) / 2);
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    if (this.options.rod) {
      ctx.beginPath();
    }
    // use the bottom center (different offset) of widget as start of the line
    if (controls) {
      ctx.moveTo(0, -10);
    } else {
      ctx.moveTo(0, 10);
    }
    if (this.options.rod) {
      const radius = size - imgSize / 2;
      const { nx, ny } = this.calcCenterPoint(r, radius, x, y);
      ctx.lineTo(nx, -ny);
      ctx.stroke();
    }
    ctx.restore();
  };

  /**
   * run the widget in animation frame
   */
  private run = () => {
    let originRotate = this.options.rotate;
    originRotate = Math.min(120, Math.max(0, originRotate));
    const cut = this.options.threshold;
    if (!this.running) {
      return;
    }
    let { r, y, t, w } = this.state;
    const thisRunUnix = Date.now();
    let _inertia = this.currentCharacter.props.i;

    // ignore if frame diff is above 16ms (60fps)
    const lastRunUnixDiff = thisRunUnix - this.lastRunTimestamp;
    if (lastRunUnixDiff < 16) {
      _inertia = (this.currentCharacter.props.i / this.frameIntervalMs) * lastRunUnixDiff;
    }
    this.lastRunTimestamp = thisRunUnix;

    w = w - r * 2 - originRotate;
    r = r + w * _inertia * 1.2;
    this.state.w = w * this.currentCharacter.props.d;
    this.state.r = r;
    t = t - y * 2;
    y = y + t * _inertia * 2;
    this.state.t = t * this.currentCharacter.props.d;
    this.state.y = y;

    // stop if motion is too little
    if (
      Math.max(
        Math.abs(this.state.w),
        Math.abs(this.state.r),
        Math.abs(this.state.t),
        Math.abs(this.state.y)
      ) < cut
    ) {
      this.running = false;
      return;
    }

    this.draw();
    requestAnimationFrame(this.run);
  };

  /**
   * manually move the widget
   */
  private move = (x: number, y: number) => {
    const { maxR, maxY, minY } = this.limit;
    let r = x * this.currentCharacter.props.s;
    r = Math.max(-maxR, r);
    r = Math.min(maxR, r);
    y = y * this.currentCharacter.props.s * 2;
    y = Math.max(minY, y);
    y = Math.min(maxY, y);
    this.state.r = r;
    this.state.y = y;
    this.state.w = 0;
    this.state.t = 0;
    this.draw();
  };

  /**
   * handle mouse down event
   */
  private onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    this.running = false;
    const { pageY } = e;
    const _downPageY = pageY;
    this.state.w = 0;
    this.state.t = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = this.domMain.getBoundingClientRect();
      const leftCenter = rect.left + rect.width / 2;
      const { pageX, pageY } = e;
      const x = pageX - leftCenter;
      const y = pageY - _downPageY;
      this.move(x, y);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      this.running = true;
      requestAnimationFrame(this.run);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  /**
   * handle touch start event
   */
  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    this.running = false;
    if (!e.touches[0]) {
      return;
    }
    const { pageY } = e.touches[0];
    const _downPageY = pageY;
    this.state.w = 0;
    this.state.t = 0;

    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) {
        return;
      }
      const rect = this.domMain.getBoundingClientRect();
      const leftCenter = rect.left + rect.width / 2;
      const { pageX, pageY } = e.touches[0];
      const x = pageX - leftCenter;
      const y = pageY - _downPageY;
      this.move(x, y);
    };

    const onTouchEnd = () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      this.running = true;
      requestAnimationFrame(this.run);
    };

    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
  };

  /**
   * do a force on widget (for auto mode)
   */
  private magicForce = () => {
    // 0.1 probability to randomly switch character
    if (Math.random() < 0.1) {
      const available = Object.keys(registry.characters);
      const index = Math.floor(Math.random() * available.length);
      const _char = available[index];
      this.setCharacter(_char);
    } else {
      // add random velocities in the vertical and horizontal directions
      this.state.t = this.state.t + (Math.random() - 0.5) * 150;
      this.state.w = this.state.w + (Math.random() - 0.5) * 200;
    }

    if (!this.running) {
      this.running = true;
      requestAnimationFrame(this.run);
    }
    // set a variable delay between applying magic powers
    this.magicForceTimeout = window.setTimeout(
      this.magicForce,
      Math.random() * 3000 + 2000
    );
  };

  /**
   * switch the auto mode
   */
  triggerAutoMode = () => {
    this.magicForceEnabled = !this.magicForceEnabled;

    // toggle icon rotate
    const icon = this.domCtrlMagic.querySelector('svg') as SVGSVGElement;
    if (this.magicForceEnabled) {
      icon.classList.add('sakana-widget-icon--rotate');
    } else {
      icon.classList.remove('sakana-widget-icon--rotate');
    }

    // clear the timer or start a timer
    clearTimeout(this.magicForceTimeout);
    if (this.magicForceEnabled) {
      this.magicForceTimeout = window.setTimeout(
        this.magicForce,
        Math.random() * 1000 + 500
      );
    }
  };

  /**
   * set current state of widget
   */
  setState = (state: Partial<SakanaWidgetState>) => {
    if (!this.state) {
      this.state = {} as SakanaWidgetState; // <-- wdym
    }
    this.state = {...this.state, ...state}
    return this;
  };

  /**
   * set current character of widget
   */
  setCharacter = (name: string) => {
    const targetChar = registry.characters[name];
    if (!targetChar) {
      throw new Error(`invalid character ${name}`);
    }
    this.char = name;
    this.currentCharacter = targetChar
    this.setState(targetChar.initialState);

    // refresh the widget image
    if (this.domImage) {
      this.domImage.style.backgroundImage = `url('${this.currentCharacter.image}')`;
    }
    return this;
  };

  /**
   * set to next character of widget
   */
  nextCharacter = () => {
    const _chars = Object.keys(registry.getCharacters()).sort();
    const curCharIdx = _chars.indexOf(this.char);
    const nextCharIdx = (curCharIdx + 1) % _chars.length;
    const nextChar = _chars[nextCharIdx];
    this.setCharacter(nextChar);
    return this;
  };

  /**
   * handle widget resize
   */
  _onResize = (rect: DOMRect) => {
    let newSize = Math.min(rect.width, rect.height);
    newSize = Math.max(120, newSize); // at least 120
    this.updateSize(newSize);
    this.updateLimit(newSize);
  };

  /**
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
    const parent = _el.parentNode;
    if (!parent) {
      throw new Error('Invalid mounting element parent');
    }

    // append event listeners
    if (this.options.draggable) {
      this.domImage.addEventListener('mousedown', this.onMouseDown);
      this.domImage.addEventListener('touchstart', this.onTouchStart);
    }

    this.domCtrlPerson.addEventListener('click', this.nextCharacter);
    this.domCtrlMagic.addEventListener('click', this.triggerAutoMode);
    this.domCtrlClose.addEventListener('click', this.unmount);

    // if auto fit mode
    if (this.options.autoFit) {
      // initial resize
      this._onResize(this.domWrapper.getBoundingClientRect());
      // handle future resize
      this.resizeObserver = new ResizeObserver(
        throttle((entries) => {
          if (!entries || !entries[0]) return;
          this._onResize(entries[0].contentRect);
        })
      );
      this.resizeObserver.observe(this.domWrapper);
    }

    // mount node
    const _newEl = _el.cloneNode(false) as HTMLElement;
    _newEl.appendChild(this.domWrapper);
    parent.replaceChild(_newEl, _el);
    requestAnimationFrame(this.run);
    return this;
  };

  /**
   * unmount the widget
   */
  unmount = () => {
    // remove event listeners
    this.domImage.removeEventListener('mousedown', this.onMouseDown);
    this.domImage.removeEventListener('touchstart', this.onTouchStart);
    this.domCtrlPerson.removeEventListener('click', this.nextCharacter);
    this.domCtrlMagic.removeEventListener('click', this.triggerAutoMode);
    this.domCtrlClose.removeEventListener('click', this.unmount);

    // if auto fit mode
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // unmount node
    const _el = this.domWrapper.parentNode;
    if (!_el) {
      throw new Error('Invalid mounting element');
    }
    _el.removeChild(this.domWrapper);
    return this;
  };
}

export default SakanaWidget;
export type { SakanaWidgetCharacter, SakanaWidgetState, SakanaWidgetOptions };
