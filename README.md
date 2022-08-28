<p align="center">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/html/chisato.png" height="160px">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/html/takina.png" height="160px">
</p>

# 🐟「Sakana! Widget」

[English](https://github.com/dsrkafuu/sakana-widget/blob/main/README.md) | [简体中文](https://github.com/dsrkafuu/sakana-widget/blob/main/README.zh.md)

[![NPM](https://img.shields.io/npm/v/sakana-widget)](https://www.npmjs.com/package/sakana-widget)
[![License](https://img.shields.io/github/license/dsrkafuu/sakana-widget)](https://github.com/dsrkafuu/sakana-widget/blob/main/LICENSE)

<https://sakana.dsrkafuu.net>

Add the Sakana! Widget to your own web page! Support custom images, runtime parameters and more!

## Features

- Register and use your own character
- Press and hold the stand and drag, after releasing the hand the stand will bounce in the opposite direction
- Use control bar to switch roles and use other functions
- Automatic mode, applying a force of random size at random intervals
- Prepared for CDN/NPM import, custom parameters, chained calls

## Usage

First you need to import the module, either directly using a CDN or by installing it as an NPM package:

```html
<!-- https://cdn.jsdelivr.net/npm/sakana-widget@2.0.0/lib/sakana.min.js -->
<!-- https://cdnjs.cloudflare.com/ajax/libs/sakana-widget/2.0.0/sakana.min.js -->
<div id="sakana-widget"></div>
<script
  defer
  src="https://cdn.jsdelivr.net/npm/sakana-widget@2.0.0/lib/sakana.min.js"
></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    new SakanaWidget().mount('#sakana-widget');
  });
</script>
```

```ts
// npm install --save sakana-wdiget
import SakanaWidget from 'sakana-wdiget';
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
github.image = `https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/public/github.png`;
SakanaWidget.registerCharacter('github', github);
new SakanaWidget({ character: 'github' }).mount('#sakana-widget');
```

See the [API](#api) section below for detailed parameters and class type.

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
  d: number; // decay
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
   * switch the auto mode
   */
  triggetAutoMode();
  /**
   * mount the widget, default to `#sakana-widget`
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
