<p align="center">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/src/characters/chisato.png" height="160px">
<img src="https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/src/characters/takina.png" height="160px">
</p>

# ðãSakana! Widgetãç³èæ¨¡æå¨ç½é¡µå°ç»ä»¶

[English](https://github.com/dsrkafuu/sakana-widget/blob/main/README.md) | [ç®ä½ä¸­æ](https://github.com/dsrkafuu/sakana-widget/blob/main/README.zh.md)

[![NPM](https://img.shields.io/npm/v/sakana-widget)](https://www.npmjs.com/package/sakana-widget)
[![License](https://img.shields.io/github/license/dsrkafuu/sakana-widget)](https://github.com/dsrkafuu/sakana-widget/blob/main/LICENSE)
[![Codacy](https://img.shields.io/codacy/grade/c978c911293b45ada37f1fa8db09d8a9)](https://www.codacy.com/gh/dsrkafuu/sakana-widget/dashboard)
[![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/sakana-widget)](https://www.jsdelivr.com/package/npm/sakana-widget)
![Upstream](https://img.shields.io/badge/upstream-670c1f1-blue)
[![Rate this package](https://badges.openbase.com/js/rating/sakana-widget.svg?token=CUNJuDinmQTed7492eRloc9QKvfxxGxtPl70NKCII04=)](https://openbase.com/js/sakana-widget?utm_source=embedded&amp;utm_medium=badge&amp;utm_campaign=rate-badge)

<https://github.dsrkafuu.net/sakana-widget/>

æç³èæ¨¡æå¨æ·»å å°ä½ èªå·±çç½é¡µåï¼æ¯æèªå®ä¹å¾çãèªå¨ç¼©æ¾åæ´å¤è¿è¡åæ°ï¼

## åè½

- æ³¨åå¹¶ä½¿ç¨ä½ èªå·±çè§è²
- èªå¨ç¼©æ¾éåºï¼æå° 120px
- æä½ç«çææ½ï¼æ¾æåç«çä¼ååæ¹åå¼¹è·³
- åºåº§æ§å¶æ åæ¢è§è²åå¶ä»åè½
- èªèµ°æ¨¡å¼ï¼ä»¥éæºé´éæ½å ä¸ä¸ªå¤§å°éæºçå
- CDN/NPM å¼å¥ï¼èªå®ä¹åæ°ï¼é¾å¼è°ç¨

## ä½¿ç¨

é¦åéè¦å¼å¥æ¨¡åï¼å¯ä»¥ä½¿ç¨ CDN ç´æ¥å¼å¥æèéè¿ NPM åçå½¢å¼å®è£ï¼

```html
<!-- https://cdn.jsdelivr.net/npm/sakana-widget@2.4.1/lib/sakana.min.css -->
<!-- https://cdn.jsdelivr.net/npm/sakana-widget@2.4.1/lib/sakana.min.js -->
<!-- https://cdnjs.cloudflare.com/ajax/libs/sakana-widget/2.4.1/sakana.min.css -->
<!-- https://cdnjs.cloudflare.com/ajax/libs/sakana-widget/2.4.1/sakana.min.js -->

<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/sakana-widget@2.4.1/lib/sakana.min.css"
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
  src="https://cdn.jsdelivr.net/npm/sakana-widget@2.4.1/lib/sakana.min.js"
></script>
```

```ts
// npm install --save sakana-widget
import 'sakana-widget/lib/index.css';
import SakanaWidget from 'sakana-widget';
new SakanaWidget().mount('#sakana-widget');
```

æ¬åé»è®¤å¯¼åºä¸ä¸ªç±» `SakanaWidget`ï¼éè¿è¯¥ç±»å¯ä»¥åå§åä¸ä¸ªå°ç»ä»¶ãä¸é¢çä»£ç åå§åäºä¸ä¸ªå¨é»è®¤è®¾ç½®çç»ä»¶ï¼å¹¶å°å¶æè½½å°äº `#sakana-widget` åç´ ä¸ã

ä½ å¯ä»¥ç»§ç»­åå»ºå®ä¾å¹¶æè½½å°æ´å¤ç DOM åç´ ä¸ï¼ç»ä»¶ä¹é´é¤äºè§è²ä»¥å¤ï¼æ°æ®æ¯å®å¨ç¬ç«çï¼ééææ¹æ³æ¯æé¾å¼è°ç¨ã

ä¾å¦ï¼ä½ å¯ä»¥å¨æè½½ç»ä»¶ä¹åä¿®æ¹ä¸äºè®¾ç½®ï¼å¹¶è·å¾ä¸ä¸ªè¶æ¢éçæ°¸ç»­åæï¼

```ts
new SakanaWidget().setState({ i: 0.001, d: 1 }).mount('#sakana-widget');
```

åæèï¼éè¿ `getCharacter` éææ¹æ³è·ååç½®çè§è²å¯¹è±¡ï¼ä¿®æ¹åæ°ï¼å¹¶åå»ºä¸ä¸ªè¶æ¢éæ é»å°¼ (æ°¸ç»­) çæ³·å¥ä½ä¸ºæ°è§è²ï¼

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

å½ç¶ï¼ä½ ä¹å¯ä»¥ä½¿ç¨èªå·±çå¾ç (url æ base64) ä½ä¸ºè§è²æ¯å¦ GitHub çå¾æ ï¼

```ts
const github = SakanaWidget.getCharacter('chisato');
github.image = `https://raw.githubusercontent.com/dsrkafuu/sakana-widget/main/docs/github.png`;
SakanaWidget.registerCharacter('github', github);
new SakanaWidget({ character: 'github' }).mount('#sakana-widget');
```

è¯¦ç»çåæ°åè¿åå®ä¾è¯·è§ä¸æ [API](#api) ç« èã

## èªå¨ç¼©æ¾

å¨åå§åç»ä»¶çæ¶åè®¾ç½® `autoFit: true` å³å¯ï¼ç»ä»¶ä¼èªå¨æ ¹æ®å¶æè½½å®¹å¨çå¤§å°è¿è¡ç¼©æ¾ï¼æå° 120pxã

æ³¨æï¼å¼å¯èªå¨ç¼©æ¾æ¶éè¦**ç¡®ä¿æè½½å®¹å¨æ¯ä¸ä¸ª [BFC](https://developer.mozilla.org/docs/Web/Guide/CSS/Block_formatting_context)**ï¼æç®åçæ¹å¼å°±æ¯è®¾ç½® `position: relative` æ `position: fixed`ãç»ä»¶å¨èªå¨ç¼©æ¾æ¨¡å¼ä¸ä¼é¢å¤å¨ app åæè½½å®¹å¨ä¹é´æ·»å ä¸ä¸ªåè£¹å®¹å¨ï¼å¹¶å°å¶å®½é«è®¾ç½®ä¸º `100%`ï¼éè¿è¯¥åè£¹å®¹å¨ä¾¦æµå®éçå¤§å°ï¼å æ­¤ï¼BFC æ¯å¿é¡»çã

## API

### ç±»åå®ä¹

```ts
export interface SakanaWidgetState {
  /**
   * æ¯æ§
   */
  i: number;
  /**
   * ç²æ§
   */
  s: number;
  /**
   * è¡°å
   */
  d: number;
  /**
   * è§åº¦
   */
  r: number;
  /**
   * é«åº¦
   */
  y: number;
  /**
   * åç´éåº¦
   */
  t: number;
  /**
   * æ°´å¹³éåº¦
   */
  w: number;
}

export interface SakanaWidgetCharacter {
  image: string;
  initialState: SakanaWidgetState;
}
```

### æé å½æ°éé¡¹

```ts
export interface SakanaWidgetOptions {
  /**
   * ç»ä»¶å¤§å°ï¼é»è®¤ `200`
   */
  size?: number;
  /**
   * èªå¨éåºå®¹å¨å¤§å° (æå° 120px)ï¼é»è®¤ `false`
   */
  autoFit?: boolean;
  /**
   * è§è²ï¼é»è®¤ `chisato`
   */
  character?: 'chisato' | 'takina';
  /**
   * æ§å¶æ ï¼é»è®¤ `true`
   */
  controls?: boolean;
  /**
   * canvas çº¿æ¡è®¾ç½®ï¼é»è®¤ `#b4b4b4` & `10`
   */
  stroke?: {
    color?: string;
    width?: number;
  };
  /**
   * åæ­¢å¨ç»çéå¼ï¼é»è®¤ `0.1`
   */
  threshold?: number;
  /**
   * æè½¬è§åº¦ï¼é»è®¤ `0`
   */
  rotate?: number;
}
```

### è¿åå®ä¾

```ts
class SakanaWidget {
  /**
   * è·åæä¸ªå·²æ³¨åè§è²çæ°æ®
   */
  static getCharacter(name: string): SakanaWidgetCharacter | null;
  /**
   * è·åææå·²æ³¨åçè§è²
   */
  static getCharacters();
  /**
   * æ³¨åä¸ä¸ªæ°è§è²
   */
  static registerCharacter(name: string, character: SakanaWidgetCharacter);
  /**
   * è®¾ç½®ç»ä»¶çå½åç¶æ
   */
  setState(state: Partial<SakanaWidgetState>);
  /**
   * è®¾ç½®ç»ä»¶çå½åè§è²
   */
  setCharacter(name: string);
  /**
   * åæ¢å°ä¸ä¸ä¸ªè§è²
   */
  nextCharacter();
  /**
   * åæ¢èªèµ°æ¨¡å¼
   */
  triggetAutoMode();
  /**
   * æè½½ç»ä»¶
   */
  mount(el: HTMLElement | string);
  /**
   * ç§»é¤ç»ä»¶
   */
  unmount();
}
```

## License

æ¬é¡¹ç®ä»£ç åºäº MIT åè®®ææï¼è¯·æ³¨æé»è®¤çåç½®è§è²å¾ç**ä¸å¯ç¨äºä»»ä½åä¸æ´»å¨**ãæ¬é¡¹ç®åææ¯åºäº https://github.com/itorr/sakana çäºæ¬¡å¼åã

æç»æ¥æºï¼ å¤§ä¼ã¢ãª [@blue00f4](https://twitter.com/blue00f4) [pixiv](https://pixiv.me/aoiroblue1340)
