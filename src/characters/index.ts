import type { SakanaWidgetCharacter } from '../types';
import { getDefaultCharacterConfiguration } from '../utils';
import _chisato from './chisato.png';
import _takina from './takina.png';

export const chisato: SakanaWidgetCharacter = {
  image: _chisato,
  ...getDefaultCharacterConfiguration("chisato")
};

export const takina: SakanaWidgetCharacter = {
  image: _takina,
  ...getDefaultCharacterConfiguration("takina")
};
