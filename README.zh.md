<p align="center">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/src/characters/chisato.png" height="160px">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/src/characters/takina.png" height="160px">
</p>

# 🐟「Sakana! Widget」石蒜模拟器网页小组件

[English](https://github.com/dsrkafuu/sakana-widget/blob/main/README.md) | [简体中文](https://github.com/dsrkafuu/sakana-widget/blob/main/README.zh.md)

[![NPM](https://img.shields.io/npm/v/sakana-widget)](https://www.npmjs.com/package/sakana-widget)
[![License](https://img.shields.io/github/license/dsrkafuu/sakana-widget)](https://github.com/dsrkafuu/sakana-widget/blob/main/LICENSE)
[![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/sakana-widget)](https://www.jsdelivr.com/package/npm/sakana-widget)
![Upstream](https://img.shields.io/badge/upstream-670c1f1-blue)

<https://github.dsrkafuu.net/sakana-widget/>

把石蒜模拟器添加到你自己的网页内！支持自定义图片、自动缩放和更多运行参数！

## 功能

- 体积：`~60 kB ALL-IN-ONE JS` (2 内置角色，brotli 压缩)
- 注册并使用你自己的角色
- 自动缩放适应，最小 120px
- 按住立牌拖拽，松手后立牌会向反方向弹跳
- 底座控制栏切换角色和其他功能
- 自走模式，以随机间隔施加一个大小随机的力
- CDN/NPM 引入，自定义参数，链式调用

## 使用

首先需要引入模块，可以使用 CDN 直接引入或者通过 NPM 包的形式安装：

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
import SakanaWidget from 'sakana-widget';
new SakanaWidget().mount('#sakana-widget');
```

本包默认导出一个类 `SakanaWidget`，通过该类可以初始化一个小组件。上面的代码初始化了一个全默认设置的组件，并将其挂载到了 `#sakana-widget` 元素上。

你可以继续创建实例并挂载到更多的 DOM 元素上，组件之间除了角色以外，数据是完全独立的，非静态方法支持链式调用。

例如，你可以在挂载组件之前修改一些设置，并获得一个超慢速的永续千束：

```ts
new SakanaWidget().setState({ i: 0.001, d: 1 }).mount('#sakana-widget');
```

又或者，通过 `getCharacter` 静态方法获取内置的角色对象，修改参数，并创建一个超慢速无阻尼 (永续) 的泷奈作为新角色：

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

当然，你也可以使用自己的图片 (url 或 base64) 作为角色比如 GitHub 的图标：

```ts
const github = SakanaWidget.getCharacter('chisato');
github.image = `https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/docs/github.png`;
SakanaWidget.registerCharacter('github', github);
new SakanaWidget({ character: 'github' }).mount('#sakana-widget');
```

## 记忆隐藏状态

启用 `saveState: true` 可通过 localStorage 持久化小组件的隐藏状态。启用后，点击关闭按钮会通过 `display: none` 隐藏小组件并保存 `'hide'`，下次加载页面时自动恢复为隐藏状态。

被隐藏的组件可以通过调用 `show()` 实例方法从页面其他位置的按钮重新唤出。

使用 `addStateListener` 可以监听可见性变化。监听器在 mount 时固定触发一次，之后每次隐藏/唤出时也会触发。

```ts
const widget = new SakanaWidget({ saveState: true })
  .addStateListener((state) => {
    console.log(`组件当前状态: ${state}`);
  })
  .mount('#sakana-widget');

// 通过自定义按钮唤出小组件
document.getElementById('sakana-revive').addEventListener('click', () => {
  widget.show();
});
```

同一页面使用多个组件时，为每个实例指定不同的 `stateKey` 避免冲突：

```ts
new SakanaWidget({ saveState: true, stateKey: 'sakana-status-chisato' }).mount('#chisato');
new SakanaWidget({ saveState: true, stateKey: 'sakana-status-takina' }).mount('#takina');
```

`saveState` 为 `false`（默认）时，点击关闭将彻底移除组件。

详细的参数和返回实例请见下文 [API](#api) 章节。

## 自动缩放

在初始化组件的时候设置 `autoFit: true` 即可，组件会自动根据其挂载容器的大小进行缩放，最小 120px。

注意，开启自动缩放时需要**确保挂载容器是一个 [BFC](https://developer.mozilla.org/docs/Web/Guide/CSS/Block_formatting_context)**，最简单的方式就是设置 `position: relative` 或 `position: fixed`。组件在自动缩放模式下会额外在 app 和挂载容器之间添加一个包裹容器，并将其宽高设置为 `100%`，通过该包裹容器侦测实际的大小，因此，BFC 是必须的。

## API

### 类型定义

```ts
export interface SakanaWidgetState {
  /**
   * 惯性
   */
  i: number;
  /**
   * 粘性
   */
  s: number;
  /**
   * 衰减
   */
  d: number;
  /**
   * 角度
   */
  r: number;
  /**
   * 高度
   */
  y: number;
  /**
   * 垂直速度
   */
  t: number;
  /**
   * 水平速度
   */
  w: number;
}

export interface SakanaWidgetCharacter {
  image: string;
  initialState: SakanaWidgetState;
}

export type SakanaWidgetVisibility = 'show' | 'hide';
```

### 构造函数选项

```ts
export interface SakanaWidgetOptions {
  /**
   * 组件大小，默认 `200`
   */
  size?: number;
  /**
   * 自动适应容器大小 (最小 120px)，默认 `false`
   */
  autoFit?: boolean;
  /**
   * 角色，默认 `chisato`
   */
  character?: string;
  /**
   * 控制栏，默认 `true`
   */
  controls?: boolean;
  /**
   * 展示支撑杆，默认 `true`
   */
  rod?: boolean;
  /**
   * 可拖动，默认 `true`
   */
  draggable?: boolean;
  /**
   * canvas 线条设置，默认 `#b4b4b4` & `10`
   */
  stroke?: {
    color?: string;
    width?: number;
  };
  /**
   * 停止动画的阈值，默认 `0.1`
   */
  threshold?: number;
  /**
   * 旋转角度，默认 `0`
   */
  rotate?: number;
  /**
   * 开启 title 属性，默认 `false`
   */
  title?: boolean;
  /**
   * 启用 localStorage 持久化隐藏状态，默认 `false`
   */
  saveState?: boolean;
  /**
   * localStorage 存储键名，默认 `sakana-widget-status`
   */
  stateKey?: string;
}
```

### 返回实例

```ts
class SakanaWidget {
  /**
   * 获取某个已注册角色的数据
   */
  static getCharacter(name: string): SakanaWidgetCharacter | null;
  /**
   * 获取所有已注册的角色
   */
  static getCharacters();
  /**
   * 注册一个新角色
   */
  static registerCharacter(name: string, character: SakanaWidgetCharacter);
  /**
   * 设置组件的当前状态
   */
  setState(state: Partial<SakanaWidgetState>);
  /**
   * 设置组件的当前角色
   */
  setCharacter(name: string);
  /**
   * 切换到下一个角色
   */
  nextCharacter();
  /**
   * 切换自走模式
   */
  triggerAutoMode();
  /**
   * 挂载组件
   */
  mount(el: HTMLElement | string);
  /**
   * 移除组件
   */
  unmount();
  /**
   * 隐藏组件（停止动画，若 saveState 启用则持久化状态）
   */
  hide();
  /**
   * 唤出之前隐藏的组件
   */
  show();
  /**
   * 添加组件可见性变化的监听器（mount 时固定触发一次）
   */
  addStateListener(listener: (state: SakanaWidgetVisibility) => void): this;
  /**
   * 移除之前添加的状态监听器
   */
  removeStateListener(listener: (state: SakanaWidgetVisibility) => void): this;
}
```

## License

本项目代码基于 MIT 协议授权，请注意默认的内置角色图片**不可用于任何商业活动**。本项目前期是基于 https://github.com/itorr/sakana 的二次开发。

插画来源： 大伏アオ [@blue00f4](https://twitter.com/blue00f4) [pixiv](https://pixiv.me/aoiroblue1340)
