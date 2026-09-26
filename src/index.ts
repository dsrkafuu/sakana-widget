import chisato from './characters/chisato';
import takina from './characters/takina';
import SakanaWidget from './core';

SakanaWidget.registerCharacter('chisato', chisato);
SakanaWidget.registerCharacter('takina', takina);

export default SakanaWidget;
export type {
  SakanaWidgetCharacter,
  SakanaWidgetOptions,
  SakanaWidgetControl,
  SakanaWidgetState,
  SakanaWidgetVisibility,
} from './core';
