import { afterEach, beforeEach, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

import { Window } from 'happy-dom';

const browser = new Window({ url: 'http://localhost/' });
globalThis.window = browser;
globalThis.document = browser.document;
globalThis.localStorage = browser.localStorage;

const frames = new Map();
let nextFrameId = 1;
globalThis.requestAnimationFrame = (callback) => {
  const id = nextFrameId++;
  frames.set(id, callback);
  return id;
};
globalThis.cancelAnimationFrame = (id) => frames.delete(id);
globalThis.ResizeObserver = class {
  observe() {}
  disconnect() {}
};

const { default: SakanaWidget } = await import('../lib/index.js');
const widgets = [];

function mount(options = {}, host = document.createElement('div')) {
  document.body.appendChild(host);
  const widget = new SakanaWidget(options).mount(host);
  widgets.push(widget);
  return { widget, host };
}

function runFrame(time) {
  const callbacks = [...frames.values()];
  frames.clear();
  for (const callback of callbacks) callback(time);
}

function touchEvent(type, touches, changedTouches = touches) {
  const event = new browser.Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    touches: { value: touches },
    changedTouches: { value: changedTouches },
  });
  return event;
}

beforeEach(() => {
  document.body.replaceChildren();
  localStorage.clear();
  frames.clear();
  widgets.length = 0;
});

afterEach(() => {
  for (const widget of widgets) widget.unmount();
  frames.clear();
});

test('mount preserves the host, its children, and its listeners', () => {
  const host = document.createElement('div');
  const existing = document.createElement('span');
  host.appendChild(existing);
  let events = 0;
  host.addEventListener('probe', () => events++);

  const { widget } = mount({}, host);
  expect(host.firstChild).toBe(existing);
  expect(host.querySelector('.sakana-widget-wrapper')).not.toBeNull();
  host.dispatchEvent(new browser.Event('probe'));
  expect(events).toBe(1);

  widget.unmount();
  expect(host.firstChild).toBe(existing);
  expect(host.querySelector('.sakana-widget-wrapper')).toBeNull();
  widget.mount(host);
  expect(host.querySelector('.sakana-widget-wrapper')).not.toBeNull();
});

test('rod uses a DOM element and respects the rod option', () => {
  const visible = mount().host;
  const hidden = mount({ rod: false }).host;
  expect(document.querySelector('canvas')).toBeNull();
  expect(visible.querySelector('.sakana-widget-rod').style.display).toBe('');
  expect(hidden.querySelector('.sakana-widget-rod').style.display).toBe('none');
});

test('ESM core excludes built-in images and character entries contain only their own image', async () => {
  const core = readFileSync(new URL('../lib/core.js', import.meta.url), 'utf8');
  const chisatoModule = readFileSync(
    new URL('../lib/characters/chisato.js', import.meta.url),
    'utf8',
  );
  const takinaModule = readFileSync(
    new URL('../lib/characters/takina.js', import.meta.url),
    'utf8',
  );
  const chisatoImage = readFileSync(
    new URL('../src/characters/chisato.png', import.meta.url),
  ).toString('base64');
  const takinaImage = readFileSync(
    new URL('../src/characters/takina.png', import.meta.url),
  ).toString('base64');
  expect(core).not.toContain('data:image/png');
  expect(chisatoModule).toContain(chisatoImage);
  expect(chisatoModule).not.toContain(takinaImage);
  expect(takinaModule).toContain(takinaImage);
  expect(takinaModule).not.toContain(chisatoImage);

  const [{ default: CoreWidget }, { default: chisato }] = await Promise.all([
    import('sakana-widget/core'),
    import('sakana-widget/characters/chisato'),
  ]);
  expect(CoreWidget.getCharacters()).toEqual({});
  CoreWidget.registerCharacter('chisato', chisato);
  const host = document.createElement('div');
  document.body.appendChild(host);
  const widget = new CoreWidget().mount(host);
  widgets.push(widget);
  expect(host.querySelector('.sakana-widget-img').style.backgroundImage).toContain(
    'data:image/png',
  );
});

test('published declarations reference a stable shared types file', () => {
  const coreTypes = readFileSync(new URL('../lib/core.d.ts', import.meta.url), 'utf8');
  const characterTypes = readFileSync(
    new URL('../lib/characters/chisato.d.ts', import.meta.url),
    'utf8',
  );
  const sharedTypes = readFileSync(new URL('../lib/types.d.ts', import.meta.url), 'utf8');
  expect(coreTypes).toContain('./types.js');
  expect(characterTypes).toContain('../types.js');
  expect(sharedTypes).toContain('SakanaWidgetCharacter');
});

test('controls are named native buttons and auto mode state resets on hide', () => {
  const { widget, host } = mount({ saveState: true });
  const buttons = [...host.querySelectorAll('button')];
  expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual([
    'Next Character',
    'Auto Mode',
    'Close',
  ]);
  const auto = buttons[1];
  expect(auto.getAttribute('aria-pressed')).toBe('false');
  auto.click();
  expect(auto.getAttribute('aria-pressed')).toBe('true');
  expect(auto.querySelector('svg').classList.contains('sakana-widget-icon--rotate')).toBe(true);
  widget.hide();
  expect(auto.getAttribute('aria-pressed')).toBe('false');
  expect(auto.querySelector('svg').classList.contains('sakana-widget-icon--rotate')).toBe(false);
  widget.show();
  expect(host.querySelector('.sakana-widget-wrapper').style.display).toBe('');
});

test('rapid hide and show keep only one animation frame scheduled', () => {
  const { widget } = mount();
  expect(frames.size).toBe(1);
  widget.hide();
  expect(frames.size).toBe(0);
  widget.show();
  expect(frames.size).toBe(1);
  widget.hide();
  widget.show();
  expect(frames.size).toBe(1);
});

test('saved hide state restores without a running frame or duplicate notification', () => {
  localStorage.setItem('sakana-widget-status', 'hide');
  const host = document.createElement('div');
  document.body.appendChild(host);
  const widget = new SakanaWidget({ saveState: true });
  widgets.push(widget);
  const states = [];
  widget.addStateListener((state) => states.push(state)).mount(host);
  expect(host.querySelector('.sakana-widget-wrapper').style.display).toBe('none');
  expect(frames.size).toBe(0);
  expect(states).toEqual(['hide']);
  widget.show();
  expect(localStorage.getItem('sakana-widget-status')).toBe('show');
  expect(frames.size).toBe(1);
});

test('state and character changes redraw and restart a settled widget', () => {
  const { widget, host } = mount();
  const image = host.querySelector('.sakana-widget-img');
  widget.setState({ r: 0, y: 0, w: 0, t: 0 });
  runFrame(0);
  expect(frames.size).toBe(0);

  widget.setState({ r: 20 });
  expect(image.style.transform).toContain('rotate(20deg)');
  expect(frames.size).toBe(1);
  widget.setCharacter('takina');
  expect(image.style.transform).toContain('rotate(12deg)');
  expect(frames.size).toBe(1);
});

test('mouse dragging uses viewport coordinates on scrolled pages', () => {
  const { host } = mount();
  host.querySelector('.sakana-widget-main').getBoundingClientRect = () => ({
    left: 100,
    width: 200,
  });
  const image = host.querySelector('.sakana-widget-img');
  const down = new browser.MouseEvent('mousedown', { bubbles: true, button: 0, clientY: 300 });
  Object.defineProperty(down, 'pageY', { value: 1300 });
  image.dispatchEvent(down);
  const move = new browser.MouseEvent('mousemove', {
    bubbles: true,
    clientX: 210,
    clientY: 320,
  });
  Object.defineProperties(move, { pageX: { value: 1210 }, pageY: { value: 1320 } });
  document.dispatchEvent(move);
  expect(image.style.transform).toBe('rotate(1deg) translateX(1px) translateY(4px)');
  document.dispatchEvent(new browser.MouseEvent('mouseup'));
});

test('touch dragging uses viewport coordinates and ends its drag', () => {
  const { host } = mount();
  host.querySelector('.sakana-widget-main').getBoundingClientRect = () => ({
    left: 100,
    width: 200,
  });
  const image = host.querySelector('.sakana-widget-img');
  const start = { identifier: 1, clientX: 200, clientY: 300, pageX: 1200, pageY: 1300 };
  const moved = { identifier: 1, clientX: 210, clientY: 320, pageX: 1210, pageY: 1320 };
  image.dispatchEvent(touchEvent('touchstart', [start]));
  document.dispatchEvent(touchEvent('touchmove', [moved]));
  expect(image.style.transform).toBe('rotate(1deg) translateX(1px) translateY(4px)');
  document.dispatchEvent(touchEvent('touchend', [], [moved]));
  expect(frames.size).toBe(1);
});

test('longer animation frames advance the motion farther', () => {
  const { widget, host } = mount();
  const image = host.querySelector('.sakana-widget-img');
  const frameAt = (interval) => {
    widget.setState({ r: 0, y: 20, w: 0, t: 0, i: 0.08, d: 1 });
    runFrame(0);
    runFrame(interval);
    const match = image.style.transform.match(/translateY\(([-\d.]+)px\)/);
    return Number(match[1]);
  };
  const shortFrameY = frameAt(1000 / 60);
  widget.hide();
  widget.show();
  const longFrameY = frameAt(1000 / 30);
  expect(Math.abs(longFrameY - 20)).toBeGreaterThan(Math.abs(shortFrameY - 20));
});

test('a configured rotation can settle without keeping animation frames alive', () => {
  const { widget } = mount({ rotate: 60 });
  widget.setState({ r: -30, y: 0, w: 0, t: 0 });
  runFrame(0);
  expect(frames.size).toBe(0);
});

test('autoFit measures the wrapper after it is attached', () => {
  const original = browser.HTMLElement.prototype.getBoundingClientRect;
  browser.HTMLElement.prototype.getBoundingClientRect = function () {
    if (this.classList.contains('sakana-widget-wrapper') && this.parentElement) {
      return { width: 300, height: 240 };
    }
    return original.call(this);
  };
  try {
    const { host } = mount({ autoFit: true });
    expect(host.querySelector('.sakana-widget-app').style.width).toBe('240px');
  } finally {
    browser.HTMLElement.prototype.getBoundingClientRect = original;
  }
});
