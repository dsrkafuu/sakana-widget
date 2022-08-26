<p align="center">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/html/chisato.png" height="160px">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/html/sakana.png" height="160px">
</p>

# 🐟「Sakana! Widget」石蒜模拟器网页小组件

[简体中文](https://github.com/dsrkafuu/sakana-widget/blob/main/README.md) | [English](https://github.com/dsrkafuu/sakana-widget/blob/main/README.en.md)

[![Upstream](https://img.shields.io/badge/upstream-39a27f2-orange)](https://github.com/itorr/sakana)
[![NPM](https://img.shields.io/npm/v/sakana-widget)](https://www.npmjs.com/package/sakana-widget)

网页小组件版本的石蒜模拟器。

Demo: https://sakana.dsrkafuu.net/

## License

本项目代码基于 MIT 协议授权，请注意图片**不可用于任何商业活动**，此类场景请自行替换图片并编译。

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

在 HTML `body` 的末尾添加：

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

### 通过 NPM 安装

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

### 参数

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

### 返回实例

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

## 参考

本项目是基于 https://github.com/itorr/sakana 的二次开发。

插画来源： 大伏アオ [@blue00f4](https://twitter.com/blue00f4) [pixiv](https://pixiv.me/aoiroblue1340)
