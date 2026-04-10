/*! sakana-widget | DSRKafuU (https://dsrkafuu.net) | Copyright (c) MIT License */

import { chisato, takina } from '../characters';
import { SakanaWidget as CoreSakana } from '../core';
import '../index.scss';
import type {
  SakanaWidgetCharacter,
  SakanaWidgetCharacterConfiguration,
  SakanaWidgetOptions,
  SakanaWidgetProps,
  SakanaWidgetRegistry,
  SakanaWidgetState,
} from '../types';

interface UmdSakana extends CoreSakana {
  chisato: SakanaWidgetCharacter;
  takina: SakanaWidgetCharacter;
}

const SakanaWidget = CoreSakana as unknown as UmdSakana;

SakanaWidget.chisato = chisato;
SakanaWidget.takina = takina;

export default SakanaWidget;
export type {
  SakanaWidgetProps,
  SakanaWidgetState,
  SakanaWidgetCharacter,
  SakanaWidgetCharacterConfiguration,
  SakanaWidgetRegistry,
  SakanaWidgetOptions,
};
