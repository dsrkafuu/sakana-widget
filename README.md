<p align="center">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/html/chisato.png" height="160px">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/html/sakana.png" height="160px">
</p>

# 🐟「Sakana! Widget」石蒜模拟器网页小组件

[English](https://github.com/dsrkafuu/sakana-widget/blob/main/README.md) | [简体中文](https://github.com/dsrkafuu/sakana-widget/blob/main/README.zh.md)

[![Upstream](https://img.shields.io/badge/upstream-39a27f2-orange)](https://github.com/itorr/sakana)
[![NPM](https://img.shields.io/npm/v/sakana-widget)](https://www.npmjs.com/package/sakana-widget)

Sakana~ emulator for usage as Web widget.

Demo: https://sakana.dsrkafuu.net/

## License

Released under MIT License, please note that the images **should not be used for any commercial activities**, please replace the images and compile the library yourself under such circumstances.

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

After HTML `body`:

```html
<script>
  function initSakanaWidget() {
    SakanaWidget({ defaultCharacter: 'takina' });
  }
</script>
<script
  async
  onload="initSakanaWidget()"
  src="https://cdn.jsdelivr.net/npm/sakana-widget@1.0.0/dist/sakana.min.js"
></script>
```

### NPM Import

```bash
npm add sakana-wdiget
```

```ts
import SakanaWidget from 'sakana-wdiget';
document.addEventListener('DOMContentLoaded', () => {
  SakanaWidget({ defaultCharacter: 'chisato' });
});
```

## API

### Params

```ts
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
```

### Return Instance

```ts
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
```

## Reference

This project is based on https://github.com/itorr/sakana.

Image source: 大伏アオ [@blue00f4](https://twitter.com/blue00f4) [pixiv](https://pixiv.me/aoiroblue1340)
