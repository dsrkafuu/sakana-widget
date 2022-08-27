import './index.scss';
import { cloneDeep, getCanvasCtx } from './utils';
import { isync, igithub, iperson, iclose } from './icons';

/**
 * widget status values
 */
interface SakanaWidgetStateValues {
  r: number; // angle
  y: number; // height
  t: number; // vertical speed
  w: number; // horizontal speed
  d: number; // decay
}

/**
 * initial motion states
 */
const initialValues: {
  [key: string]: SakanaWidgetStateValues;
} = {
  chisato: { r: 1, y: 40, t: 0, w: 0, d: 0.99 },
  takina: { r: 12, y: 2, t: 0, w: 0, d: 0.988 },
};

/**
 * widget customization options
 */
export interface SakanaWidgetOptions {
  /**
   * mounting container or css query selector, default to `#sakana-widget`
   */
  container?: HTMLElement | string;
  /**
   * widget size, default to `200`
   */
  size?: number;
  /**
   * default character, default to `chisato`
   */
  character?: 'chisato' | 'takina';
  /**
   * image motion inertia, default to `0.08`
   */
  inertia?: number;
  /**
   * image motion decay, default to different value based on character
   */
  decay?: number;
  /**
   * canvas stroke color, default to `#b4b4b4`
   */
  strokeColor?: string;
  /**
   * canvas stroke width, default to `10`
   */
  strokeWidth?: number;
}

const defaultOptions: SakanaWidgetOptions = {
  container: '#sakana-widget',
  size: 200,
  character: 'chisato',
  inertia: 0.08,
  strokeColor: '#b4b4b4',
  strokeWidth: 10,
};

/**
 * widget instance
 */
export interface SakanaWidgetInstance {
  /**
   * instance dom element
   */
  node: HTMLElement;
  /**
   * remove the widget
   */
  destroy: () => void;
}

let _instance: SakanaWidgetInstance | null = null;

/**
 * create a sakana! widget or get current widget
 */
function SakanaWidget(options: SakanaWidgetOptions = {}) {
  // singleton
  if (_instance) {
    return _instance;
  }

  // init options
  const opts = Object.assign({}, defaultOptions, options);

  // widget states
  const size = opts.size!;
  const imgSize = size / 1.25;
  let character = opts.character!;
  if (!initialValues[character]) {
    throw new Error('invalid character');
  }
  const sticky = 0.1;
  const inertia = opts.inertia!;
  if (typeof opts.decay === 'number') {
    Object.keys(initialValues).forEach((key) => {
      const item = initialValues[key as keyof typeof initialValues];
      item.d = opts.decay!;
    });
  }
  const strokeColor = opts.strokeColor!;
  const strokeWidth = opts.strokeWidth!;
  let running = true;
  const values: SakanaWidgetStateValues = cloneDeep(initialValues[character]);

  // limitation props
  let maxR = size / 5;
  if (maxR < 30) {
    maxR = 30;
  } else if (maxR > 60) {
    maxR = 60;
  }
  const maxY = size / 4;
  const minY = -maxY;

  // init dom nodes
  let oldNode: HTMLElement | null = null;
  if (typeof opts.container === 'string') {
    oldNode = document.querySelector(opts.container);
  } else if (opts.container instanceof HTMLElement) {
    oldNode = opts.container;
  }
  if (!oldNode) {
    throw new Error('invalid container');
  }
  const node = oldNode.cloneNode() as HTMLElement;
  const app = document.createElement('div');
  app.className = 'sakana-widget-app';
  app.style.width = `${size}px`;
  app.style.height = `${size}px`;
  node.appendChild(app);
  const canvas = document.createElement('canvas');
  canvas.className = 'sakana-widget-canvas';
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  const ctx = getCanvasCtx(canvas, size);
  if (!ctx) {
    throw new Error('canvas not supported');
  }
  app.appendChild(canvas);
  const main = document.createElement('div');
  main.className = 'sakana-widget-main';
  main.style.width = `${size}px`;
  main.style.height = `${size}px`;
  app.appendChild(main);
  const img = document.createElement('div');
  img.className = `sakana-widget-img sakana-widget-img--${character}`;
  img.style.width = `${imgSize}px`;
  img.style.height = `${imgSize}px`;
  img.style.transformOrigin = `50% ${size}px`; // use the bottom center of widget as trans origin
  main.appendChild(img);
  const ctrl = document.createElement('div');
  ctrl.className = 'sakana-widget-ctrl';
  main.appendChild(ctrl);
  const itemClass = 'sakana-widget-ctrl-item';
  const person = document.createElement('div');
  person.className = itemClass;
  person.innerHTML = iperson;
  ctrl.appendChild(person);
  const magic = document.createElement('div');
  magic.className = itemClass;
  magic.innerHTML = isync;
  ctrl.appendChild(magic);
  const github = document.createElement('a');
  github.className = itemClass;
  github.href = '//github.com/dsrkafuu/sakana-widget';
  github.target = '_blank';
  github.innerHTML = igithub;
  ctrl.appendChild(github);
  const close = document.createElement('div');
  close.className = itemClass;
  close.innerHTML = iclose;
  ctrl.appendChild(close);

  /**
   * calculate center of the image
   */
  const calcCenterPoint = (
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
  const draw = () => {
    // move the image
    const { r, y } = values;
    const x = r * 1;
    img.style.transform = `rotate(${r}deg) translateX(${x}px) translateY(${y}px)`;
    // draw the canvas line
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size); // use the bottom center of widget as axis origin
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.moveTo(0, -10); // use the bottom center of widget as start of the line
    const radius = size - imgSize / 2;
    const { nx, ny } = calcCenterPoint(r, radius, x, y);
    ctx.lineTo(nx, -ny);
    ctx.stroke();
    ctx.restore();
  };

  const or = 0;
  const cut = 0.1;
  /**
   * run the widget
   */
  const run = () => {
    if (!running) {
      return;
    }
    let { r, y, t, w } = values;
    const { d } = values;
    w = w - r * 2 - or;
    r = r + w * inertia * 1.2;
    values.w = w * d;
    values.r = r;
    t = t - y * 2;
    y = y + t * inertia * 2;
    values.t = t * d;
    values.y = y;
    // stop if motion is too little
    if (
      Math.max(
        Math.abs(values.w),
        Math.abs(values.r),
        Math.abs(values.t),
        Math.abs(values.y)
      ) < cut
    ) {
      running = false;
      return;
    }
    requestAnimationFrame(run);
    draw();
  };
  requestAnimationFrame(run);

  /**
   * manually move the widget
   */
  const move = (x: number, y: number) => {
    let r = x * sticky;
    r = Math.max(-maxR, r);
    r = Math.min(maxR, r);
    y = y * sticky * 2;
    y = Math.max(minY, y);
    y = Math.min(maxY, y);
    values.r = r;
    values.y = y;
    values.w = 0;
    values.t = 0;
    draw();
  };

  /**
   * handle mouse events
   */
  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    running = false;
    const { pageY } = e;
    const _downPageY = pageY;
    values.w = 0;
    values.t = 0;
    const onMouseMove = (e: MouseEvent) => {
      const rect = main.getBoundingClientRect();
      const leftCenter = rect.left + rect.width / 2;
      const { pageX, pageY } = e;
      const x = pageX - leftCenter;
      const y = pageY - _downPageY;
      move(x, y);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      running = true;
      requestAnimationFrame(run);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  img.addEventListener('mousedown', onMouseDown);

  /**
   * handle touch events
   */
  const onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    running = false;
    if (!e.touches[0]) {
      return;
    }
    const { pageY } = e.touches[0];
    const _downPageY = pageY;
    values.w = 0;
    values.t = 0;
    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) {
        return;
      }
      const rect = main.getBoundingClientRect();
      const leftCenter = rect.left + rect.width / 2;
      const { pageX, pageY } = e.touches[0];
      const x = pageX - leftCenter;
      const y = pageY - _downPageY;
      move(x, y);
    };
    const onTouchEnd = () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      running = true;
      requestAnimationFrame(run);
    };
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
  };
  img.addEventListener('touchstart', onTouchStart);

  // handle character switch
  const switchCharacter = () => {
    img.classList.remove(`sakana-widget-img--${character}`);
    character = character === 'chisato' ? 'takina' : 'chisato';
    Object.assign(values, cloneDeep(initialValues[character]));
    img.classList.add(`sakana-widget-img--${character}`);
  };
  person.addEventListener('click', switchCharacter);

  // auto mode
  let magicForceTimeout = 0;
  let magicForceEnabled = false;
  /**
   * do a force on widget (for auto mode)
   */
  const magicForce = () => {
    // 0.1 probability to switch character
    if (Math.random() < 0.1) {
      switchCharacter();
    } else {
      // add random velocities in the vertical and horizontal directions
      values.t = values.t + (Math.random() - 0.5) * 150;
      values.w = values.w + (Math.random() - 0.5) * 200;
    }
    if (!running) {
      running = true;
      requestAnimationFrame(run);
    }
    // set a variable delay between applying magic powers
    magicForceTimeout = window.setTimeout(
      magicForce,
      Math.random() * 3000 + 2000
    );
  };
  /**
   * switch the auto mode
   */
  const triggetMagic = () => {
    magicForceEnabled = !magicForceEnabled;
    // toggle icon rotate
    const icon = magic.querySelector('svg') as SVGSVGElement;
    if (magicForceEnabled) {
      icon.classList.add('sakana-widget-icon--rotate');
    } else {
      icon.classList.remove('sakana-widget-icon--rotate');
    }
    // clear the timer or start a timer
    clearTimeout(magicForceTimeout);
    if (magicForceEnabled) {
      magicForceTimeout = window.setTimeout(
        magicForce,
        Math.random() * 1000 + 500
      );
    }
  };
  magic.addEventListener('click', triggetMagic);

  // mount the node
  const parent = oldNode.parentNode!;
  if (!parent) {
    throw new Error('invalid container');
  }
  parent.replaceChild(node, oldNode);

  // create and return instance
  const instance: SakanaWidgetInstance = {
    node,
    destroy: () => {
      node.remove();
    },
  };

  // close widget
  close.addEventListener('click', () => {
    instance.destroy();
  });

  _instance = instance;
  return _instance;
}

export default SakanaWidget;
