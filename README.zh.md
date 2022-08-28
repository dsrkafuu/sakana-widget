<p align="center">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/src/characters/chisato.png" height="160px">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/src/characters/takina.png" height="160px">
</p>

# 🐟「Sakana! Widget」石蒜模拟器网页小组件

[English](https://github.com/dsrkafuu/sakana-widget/blob/main/README.md) | [简体中文](https://github.com/dsrkafuu/sakana-widget/blob/main/README.zh.md)

[![NPM](https://img.shields.io/npm/v/sakana-widget)](https://www.npmjs.com/package/sakana-widget)
[![License](https://img.shields.io/github/license/dsrkafuu/sakana-widget)](https://github.com/dsrkafuu/sakana-widget/blob/main/LICENSE)

<https://sakana.dsrkafuu.net>

把石蒜模拟器添加到你自己的网页内！支持自定义图片、运行参数和更多！

## 功能

- 注册并使用你自己的角色
- 按住立牌拖拽，松手后立牌会向反方向弹跳
- 底座控制栏切换角色和其他功能
- 自走模式，以随机间隔施加一个大小随机的力
- CDN/NPM 引入，自定义参数，链式调用

## 使用

首先需要引入模块，可以使用 CDN 直接引入或者通过 NPM 包的形式安装：

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
github.image = `https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/public/github.png`;
SakanaWidget.registerCharacter('github', github);
new SakanaWidget({ character: 'github' }).mount('#sakana-widget');
```

详细的参数和返回实例请见下文 [API](#api) 章节。

## API

### 类型定义

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

### 构造函数选项

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

### 返回实例

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

本项目代码基于 MIT 协议授权，请注意默认的内置角色图片**不可用于任何商业活动**。本项目前期是基于 https://github.com/itorr/sakana 的二次开发。

插画来源： 大伏アオ [@blue00f4](https://twitter.com/blue00f4) [pixiv](https://pixiv.me/aoiroblue1340)
