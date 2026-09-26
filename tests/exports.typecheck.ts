import type { SakanaWidgetControl as RootControl } from 'sakana-widget';
import chisato from 'sakana-widget/characters/chisato';
import takina from 'sakana-widget/characters/takina';
import SakanaWidget from 'sakana-widget/core';
import type { SakanaWidgetCharacter, SakanaWidgetControl } from 'sakana-widget/core';

const characters: SakanaWidgetCharacter[] = [chisato, takina];
void SakanaWidget;
void characters;

const control: SakanaWidgetControl = {
  id: 'notes',
  label: 'Open notes',
  icon: document.createElement('span'),
  onClick: (widget) => widget.hide(),
};
void control;
const rootControl: RootControl = {
  id: 'notes',
  label: 'Open notes',
  icon: document.createElement('span'),
  onClick: (widget) => widget.hide(),
};
void rootControl;
