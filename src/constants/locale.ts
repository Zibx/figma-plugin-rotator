import {LocaleTable, SelectionMessage} from '../types';

export const LOCALE: LocaleTable = {
  NOTHING_SELECTED: () => 'Please, select an object',
  NOT_SUPPORTED: (payload) => `Sorry, ${payload?.shapeType} is not supported yet`
};
