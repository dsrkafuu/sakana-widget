<p align="center">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/html/chisato.png" height="160px">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/html/sakana.png" height="160px">
</p>

# 🐟「Sakana! Widget」石蒜模拟器网页小组件

[English](https://github.com/dsrkafuu/sakana-widget/blob/main/README.md) | [简体中文](https://github.com/dsrkafuu/sakana-widget/blob/main/README.zh.md)

[![Upstream](https://img.shields.io/badge/upstream-dbf7c6d-orange)](https://github.com/itorr/sakana)
[![NPM](https://img.shields.io/npm/v/sakana-widget)](https://www.npmjs.com/package/sakana-widget)

Sakana~ emulator for usage as Web widget; DEMO: <https://sakana.dsrkafuu.net>.

## License

Released under MIT License, please note that the images **should not be used for any commercial activities**, please replace the images and compile the library yourself under such circumstances.

This project is based on https://github.com/itorr/sakana.

Image source: 大伏アオ [@blue00f4](https://twitter.com/blue00f4) [pixiv](https://pixiv.me/aoiroblue1340)

## Feature

- Press and hold the stand and drag, after releasing the hand the stand will bounce in the opposite direction
- Use control bar to switch roles and use other functions
- Automatic mode, applying a force of random size at random intervals
- Prepared for CDN/NPM import, custom parameters

Features removed:

- Gyroscope support
- Sound playback

## Usage

This package's default export is a singleton function `SakanaWidget`:

```ts
function SakanaWidget(options: SakanaWidgetOptions = {}): SakanaWidgetInstance;
```

Default mounting element is `#sakana-widget`, checkout [API](#api) section for params & return instance details.

### CDN Import

Choose the CDN provider you want to use:

- jsDelivr: `https://cdn.jsdelivr.net/npm/sakana-widget@1.2.0/lib/sakana.min.js`
- cdnjs: `https://cdnjs.cloudflare.com/ajax/libs/sakana-widget/1.2.0/sakana.min.js`
- UNPKG: `https://unpkg.com/sakana-widget@1.2.0/lib/sakana.min.js`

After HTML `body`:

```html
<div id="sakana-widget"></div>
<script>
  function initSakanaWidget() {
    SakanaWidget({ character: 'takina' });
  }
</script>
<script
  async
  onload="initSakanaWidget()"
  src="https://cdn.jsdelivr.net/npm/sakana-widget@1.2.0/lib/sakana.min.js"
></script>
```

### NPM Import

```bash
npm add sakana-wdiget
```

```ts
import SakanaWidget from 'sakana-wdiget';
document.addEventListener('DOMContentLoaded', () => {
  SakanaWidget({ character: 'chisato' });
});
```

## Fun Options

Use options below to get a slow-motion/infinite takina:

```ts
SakanaWidget({
  character: 'takina',
  inertia: 0.001,
  decay: 1,
});
```

## API

### Params

```ts
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
  /**
   * hide control bar, default to `false`
   */
  hideControls?: boolean;
}
```

### Return Instance

```ts
export interface SakanaWidgetInstance {
  /**
   * instance dom element
   */
  node: HTMLElement;
  /**
   * switch to another character
   */
  switchCharacter: () => void;
  /**
   * toggle auto mode
   */
  toggleMagicForce: () => void;
  /**
   * remove the widget
   */
  destroy: () => void;
}
```
