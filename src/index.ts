import './index.scss';
import { cloneDeep } from './utils';
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
 * widget customization options
 */
export interface SakanaWidgetOptions {
  /**
   * widget size
   */
  appSize?: number;
  /**
   * mounting container
   */
  container?: HTMLElement;
  /**
   * default character
   */
  defaultCharacter?: 'chisato' | 'takina';
  /**
   * character decay
   */
  inertia?: number;
  /**
   * character decay
   */
  decay?: number;
  /**
   * canvas stroke color
   */
  strokeColor?: string;
}

/**
 * widget instance
 */
export interface SakanaWidgetInstance {
  /**
   * instance dom element
   */
  element: HTMLElement;
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

  // init size data
  const appSize = options.appSize || 200; // widget size
  const mainSize = appSize / 1.25; // image size
  const strokeColor = options.strokeColor || '#b4b4b4'; // canvas color

  /**
   * initial states
   */
  const initialValues = {
    chisato: { r: 1, y: 40, t: 0, w: 0, d: 0.99 },
    takina: { r: 12, y: 2, t: 0, w: 0, d: 0.988 },
  };
  // characters
  let character = options.defaultCharacter || 'chisato';
  if (!initialValues[character]) {
    throw new Error(`Invalid character ${character}`);
  }

  // basic props
  const sticky = 0.1;
  const inertia = options.inertia || 0.08;
  if (typeof options.decay === 'number') {
    Object.keys(initialValues).forEach((key) => {
      const item = initialValues[key as keyof typeof initialValues];
      item.d = options.decay as number;
    });
  }

  // limitation props
  let maxR = appSize / 5;
  if (maxR < 30) {
    maxR = 30;
  } else if (maxR > 60) {
    maxR = 60;
  }
  const maxY = appSize / 4;
  const minY = -maxY;

  // widget status
  let running = true;
  const values: SakanaWidgetStateValues = cloneDeep(initialValues[character]);

  // init dom nodes
  let container = document.querySelector('#sakana-widget');
  if (options.container && container instanceof HTMLElement) {
    container = options.container;
  }
  if (!container) {
    throw new Error('Invalid mounting container');
  }
  const node = container.cloneNode() as HTMLElement;
  const app = document.createElement('div');
  app.className = 'sakana-widget-app';
  app.style.width = `${appSize}px`;
  app.style.height = `${appSize}px`;
  node.appendChild(app);
  const cvs = document.createElement('canvas');
  cvs.className = 'sakana-widget-canvas';
  const ctx = cvs.getContext('2d') as CanvasRenderingContext2D;
  cvs.width = appSize;
  cvs.height = appSize;
  app.appendChild(cvs);
  const box = document.createElement('div');
  box.className = 'sakana-widget-box';
  app.appendChild(box);
  const main = document.createElement('div');
  main.className = `sakana-widget-main sakana-widget-main--${character}`;
  main.style.width = `${mainSize}px`;
  main.style.height = `${mainSize}px`;
  main.style.transformOrigin = `50% ${appSize}px`; // use the bottom center of widget as trans origin
  box.appendChild(main);
  const ctrl = document.createElement('div');
  ctrl.className = 'sakana-widget-ctrl';
  box.appendChild(ctrl);
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
    main.style.transform = `rotate(${r}deg) translateX(${x}px) translateY(${y}px)`;
    // draw the canvas line
    ctx.clearRect(0, 0, appSize, appSize);
    ctx.save();
    ctx.translate(appSize / 2, appSize); // use the bottom center of widget as axis origin
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, -10); // use the bottom center of widget as start of the line
    const radius = appSize - mainSize / 2;
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
  main.onmousedown = (e) => {
    e.preventDefault();
    running = false;
    const { pageY } = e;
    const _downPageY = pageY;
    document.onmouseup = (e) => {
      e.preventDefault();
      document.onmousemove = null;
      document.onmouseup = null;
      running = true;
      run();
    };
    document.onmousemove = (e) => {
      const rect = box.getBoundingClientRect();
      const leftCenter = rect.left + rect.width / 2;
      const { pageX, pageY } = e;
      const x = pageX - leftCenter;
      const y = pageY - _downPageY;
      move(x, y);
    };
  };

  /**
   * handle touch events
   */
  main.ontouchstart = (e) => {
    e.preventDefault();
    running = false;
    if (!e.touches[0]) {
      return;
    }
    const { pageY } = e.touches[0];
    const _downPageY = pageY;
    document.ontouchend = () => {
      document.ontouchmove = null;
      document.ontouchend = null;
      running = true;
      run();
    };
    document.ontouchmove = (e) => {
      if (!e.touches[0]) {
        return;
      }
      const rect = box.getBoundingClientRect();
      const leftCenter = rect.left + rect.width / 2;
      const { pageX, pageY } = e.touches[0];
      const x = pageX - leftCenter;
      const y = pageY - _downPageY;
      move(x, y);
    };
  };

  // handle character switch
  const switchCharacter = () => {
    main.classList.remove(`sakana-widget-main--${character}`);
    character = character === 'chisato' ? 'takina' : 'chisato';
    Object.assign(values, cloneDeep(initialValues[character]));
    main.classList.add(`sakana-widget-main--${character}`);
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
      magicForceTimeout = window.setTimeout(magicForce, Math.random() * 1000 + 500);
    }
  };
  magic.addEventListener('click', triggetMagic);

  // mount the node
  const parent = container.parentNode;
  if (parent) {
    parent.replaceChild(node, container);
  } else {
    throw new Error('Unable to find parent element of container');
  }

  // create and return instance
  const instance: SakanaWidgetInstance = {
    element: node,
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
