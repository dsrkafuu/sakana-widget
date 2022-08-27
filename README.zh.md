<p align="center">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/html/chisato.png" height="160px">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/html/sakana.png" height="160px">
</p>

# 🐟「Sakana! Widget」石蒜模拟器网页小组件

[English](https://github.com/dsrkafuu/sakana-widget/blob/main/README.md) | [简体中文](https://github.com/dsrkafuu/sakana-widget/blob/main/README.zh.md)

[![Upstream](https://img.shields.io/badge/upstream-dbf7c6d-orange)](https://github.com/itorr/sakana)
[![NPM](https://img.shields.io/npm/v/sakana-widget)](https://www.npmjs.com/package/sakana-widget)

网页小组件版本的石蒜模拟器；DEMO：<https://sakana.dsrkafuu.net>。

## License

本项目代码基于 MIT 协议授权，请注意图片**不可用于任何商业活动**，此类场景请自行替换图片并编译。

本项目是基于 https://github.com/itorr/sakana 的二次开发。

插画来源： 大伏アオ [@blue00f4](https://twitter.com/blue00f4) [pixiv](https://pixiv.me/aoiroblue1340)

## 功能

- 按住立牌拖拽，松手后立牌会向反方向弹跳
- 底座控制栏切换角色和其他功能
- 自走模式，以随机间隔施加一个大小随机的力
- CDN/NPM 引入，自定义参数

移除的功能：

- 陀螺仪支持
- 声音播放能力

## 使用

本包默认导出一个单例模式函数 `SakanaWidget`：

```ts
function SakanaWidget(options: SakanaWidgetOptions = {}): SakanaWidgetInstance;
```

默认挂载容器为 `#sakana-widget`，参数和返回实例请见下文 [API](#api) 章节。

### 通过 CDN 引入

选择想使用的 CDN 提供商：

- jsDelivr: `https://cdn.jsdelivr.net/npm/sakana-widget@1.1.1/lib/sakana.min.js`
- cdnjs: `https://cdnjs.cloudflare.com/ajax/libs/sakana-widget/1.1.1/sakana.min.js`
- UNPKG: `https://unpkg.com/sakana-widget@1.1.1/lib/sakana.min.js`

在 HTML `body` 的末尾添加：

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
  src="https://cdn.jsdelivr.net/npm/sakana-widget@1.1.1/lib/sakana.min.js"
></script>
```

### 通过 NPM 安装

```bash
npm add sakana-wdiget
```

```ts
import SakanaWidget from 'sakana-wdiget';
document.addEventListener('DOMContentLoaded', () => {
  SakanaWidget({ character: 'chisato' });
});
```

## 有意思的参数

使用以下参数可以获得一个超慢速无阻尼 (永续) 的泷奈：

```ts
SakanaWidget({
  character: 'takina',
  inertia: 0.001,
  decay: 1,
});
```

## API

### 参数

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
}
```

### 返回实例

```ts
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
```
