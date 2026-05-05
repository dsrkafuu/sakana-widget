<p align="center">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/src/characters/chisato.png" height="160px">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/src/characters/takina.png" height="160px">
</p>

# 🐟「Sakana! Widget」

[English](https://github.com/dsrkafuu/sakana-widget/blob/main/README.md) | [简体中文](https://github.com/dsrkafuu/sakana-widget/blob/main/README.zh.md)

[![NPM](https://img.shields.io/npm/v/sakana-widget)](https://www.npmjs.com/package/sakana-widget)
[![License](https://img.shields.io/github/license/dsrkafuu/sakana-widget)](https://github.com/dsrkafuu/sakana-widget/blob/main/LICENSE)
[![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/sakana-widget)](https://www.jsdelivr.com/package/npm/sakana-widget)
![Upstream](https://img.shields.io/badge/upstream-670c1f1-blue)

<https://github.dsrkafuu.net/sakana-widget/>

Add the Sakana! Widget to your own web page! Support custom images, auto resizing and more runtime params!

## Features

- Sizes: `~60 kB ALL-IN-ONE JS` (includes 2 built-in characters, brotli compressed)
- Register and use your own character
- Auto resizing support, 120px minimum
- Press and hold the stand and drag, after releasing the hand the stand will bounce in the opposite direction
- Use control bar to switch roles and use other functions
- Automatic mode, applying a force of random size at random intervals
- Prepared for CDN/NPM import, custom parameters, chained calls

## Usage

First you need to import the module, either directly using a CDN or by installing it as an NPM package:

```html
<!-- https://cdn.jsdelivr.net/npm/sakana-widget@3.0.0/lib/index.umd.min.js -->
<!-- https://cdnjs.cloudflare.com/ajax/libs/sakana-widget/3.0.0/index.umd.min.js -->

<div id="sakana-widget"></div>
<script>
  function initSakanaWidget() {
    new SakanaWidget().mount('#sakana-widget');
  }
</script>
<script
  async
  onload="initSakanaWidget()"
  src="https://cdn.jsdelivr.net/npm/sakana-widget@3.0.0/lib/index.umd.min.js"
></script>
```

```ts
// npm install --save sakana-widget
// manual css import is no longer needed since it is imported in the js entry
// import 'sakana-widget/lib/index.css';
import SakanaWidget from 'sakana-widget';
new SakanaWidget().mount('#sakana-widget');
```

This package exports a class `SakanaWidget` by default, through which a widget can be initialized. The code above initializes a widget with default settings and mounts it to the `#sakana-widget` element.

You can continue to create widget instances and mount to more DOM elements, where the data is completely independent between widgets except for roles, and non-static methods support chaining calls.

For example, you can modify some settings before mounting a widget and get a super-slow Chisato:

```ts
new SakanaWidget().setState({ i: 0.001, d: 1 }).mount('#sakana-widget');
```

Or, get the built-in character object via the `getCharacter` static method, modify the parameters, and create a super-slow, non-damped (perpetual) Takina as a new character:

```ts
const takina = SakanaWidget.getCharacter('takina');
takina.initialState = {
  ...takina.initialState,
  i: 0.001,
  d: 1,
};
SakanaWidget.registerCharacter('takina-slow', takina);
new SakanaWidget({ character: 'takina-slow' }).mount('#sakana-widget');
```

Of course, you can use your own image (url or base64) as a character, e.g. GitHub's icon:

```ts
const github = SakanaWidget.getCharacter('chisato');
github.image = `https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/docs/github.png`;
SakanaWidget.registerCharacter('github', github);
new SakanaWidget({ character: 'github' }).mount('#sakana-widget');
```

## Persist Hide State

Enable `saveState: true` to persist the widget's hidden state via localStorage. When enabled, clicking the close button hides the widget via `display: none` and saves `'hide'`. On next page load, the widget automatically restores the hidden state.

A hidden widget can be revived by calling the `show()` instance method from a button elsewhere on the page.

```ts
const widget = new SakanaWidget({ saveState: true }).mount('#sakana-widget');

// Bring back the widget from a custom button
document.getElementById('sakana-revive').addEventListener('click', () => {
  widget.show();
});
```

To use multiple widgets on the same page, provide a unique `stateKey` for each instance to avoid conflicts:

```ts
new SakanaWidget({ saveState: true, stateKey: 'sakana-status-chisato' }).mount('#chisato');
new SakanaWidget({ saveState: true, stateKey: 'sakana-status-takina' }).mount('#takina');
```

When `saveState` is `false` (default), clicking close permanently unmounts the widget.

See the [API](#api) section below for detailed parameters and class type.

## Auto Resizing

Set `autoFit: true` when initializing the component and it will automatically scale according to the size of its mount container, minimum 120px.

Note that to turn on auto-scaling you need to **make sure the mounting container is a [BFC](https://developer.mozilla.org/docs/Web/Guide/CSS/Block_formatting_context)**, the easiest way to do this is to set ` position: relative` or `position: fixed`. Components in auto-scaling mode additionally add a wrapper container between the app and the mount container, and set its width and height to `100%` by which the actual size is detected, so the BFC is required.

## API

### Types

```ts
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
```

### Constructor Params

```ts
export interface SakanaWidgetOptions {
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
  character?: string;
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
```

### Widget Instance

```ts
class SakanaWidget {
  /**
   * get data of a registered character
   */
  static getCharacter(name: string): SakanaWidgetCharacter | null;
  /**
   * get all registered character
   */
  static getCharacters();
  /**
   * registered a new character
   */
  static registerCharacter(name: string, character: SakanaWidgetCharacter);
  /**
   * set current state of widget
   */
  setState(state: Partial<SakanaWidgetState>);
  /**
   * set current character of widget
   */
  setCharacter(name: string);
  /**
   * set to next character of widget
   */
  nextCharacter();
  /**
   * switch the auto mode
   */
  triggerAutoMode();
  /**
   * mount the widget
   */
  mount(el: HTMLElement | string);
  /**
   * unmount the widget
   */
  unmount();
  /**
   * hide the widget (stops animation, persists state if saveState is enabled)
   */
  hide();
  /**
   * show the widget if previously hidden
   */
  show();
}
```

## License

Released under MIT License, please note that the 2 default images **should not be used for any commercial activities**. This project used to be a secondary development based on https://github.com/itorr/sakana.

Image source: 大伏アオ [@blue00f4](https://twitter.com/blue00f4) [pixiv](https://pixiv.me/aoiroblue1340)
