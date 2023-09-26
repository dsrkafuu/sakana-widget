<p align="center">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/src/characters/chisato.png" height="160px">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/src/characters/takina.png" height="160px">
</p>

# 🐟「Sakana! Widget」

[English](https://github.com/dsrkafuu/sakana-widget/blob/main/README.md) | [简体中文](https://github.com/dsrkafuu/sakana-widget/blob/main/README.zh.md)

[![NPM](https://img.shields.io/npm/v/sakana-widget)](https://www.npmjs.com/package/sakana-widget)
[![License](https://img.shields.io/github/license/dsrkafuu/sakana-widget)](https://github.com/dsrkafuu/sakana-widget/blob/main/LICENSE)
[![Codacy](https://img.shields.io/codacy/grade/c978c911293b45ada37f1fa8db09d8a9)](https://www.codacy.com/gh/dsrkafuu/sakana-widget/dashboard)
[![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/sakana-widget)](https://www.jsdelivr.com/package/npm/sakana-widget)
![Upstream](https://img.shields.io/badge/upstream-670c1f1-blue)
[![Rate this package](https://badges.openbase.com/js/rating/sakana-widget.svg?token=CUNJuDinmQTed7492eRloc9QKvfxxGxtPl70NKCII04=)](https://openbase.com/js/sakana-widget?utm_source=embedded&utm_medium=badge&utm_campaign=rate-badge)

<https://github.dsrkafuu.net/sakana-widget/>

Add the Sakana! Widget to your own web page! Support custom images, auto resizing and more runtime params!

## Features

- Register and use your own character
- Auto resizing support, 120px minimum
- Press and hold the stand and drag, after releasing the hand the stand will bounce in the opposite direction
- Use control bar to switch roles and use other functions
- Automatic mode, applying a force of random size at random intervals
- Prepared for CDN/NPM import, custom parameters, chained calls

## Usage

First you need to import the module, either directly using a CDN or by installing it as an NPM package:

```html
<!-- https://cdn.jsdelivr.net/npm/sakana-widget@2.7.0/lib/sakana.min.css -->
<!-- https://cdn.jsdelivr.net/npm/sakana-widget@2.7.0/lib/sakana.min.js -->
<!-- https://cdnjs.cloudflare.com/ajax/libs/sakana-widget/2.7.0/sakana.min.css -->
<!-- https://cdnjs.cloudflare.com/ajax/libs/sakana-widget/2.7.0/sakana.min.js -->

<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/sakana-widget@2.7.0/lib/sakana.min.css"
/>
<div id="sakana-widget"></div>
<script>
  function initSakanaWidget() {
    new SakanaWidget().mount('#sakana-widget');
  }
</script>
<script
  async
  onload="initSakanaWidget()"
  src="https://cdn.jsdelivr.net/npm/sakana-widget@2.7.0/lib/sakana.min.js"
></script>
```

```ts
// npm install --save sakana-widget
import 'sakana-widget/lib/index.css';
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
  character?: 'chisato' | 'takina';
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
  triggetAutoMode();
  /**
   * mount the widget
   */
  mount(el: HTMLElement | string);
  /**
   * unmount the widget
   */
  unmount();
}
```

## License

Released under MIT License, please note that the 2 default images **should not be used for any commercial activities**. This project used to be a secondary development based on https://github.com/itorr/sakana.

Image source: 大伏アオ [@blue00f4](https://twitter.com/blue00f4) [pixiv](https://pixiv.me/aoiroblue1340)
