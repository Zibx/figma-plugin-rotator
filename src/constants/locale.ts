import {LocaleTable, SelectionMessage} from '../types';

export const LOCALE: LocaleTable = {
  NOTHING_SELECTED: () => 'Please, select an object',
  NOT_SUPPORTED: (payload) => `Sorry, ${payload?.shapeType} is not supported yet`,
  ROTATE_INVITE_LABEL: () => `Rotate!`,
  UPDATE_VECTOR_DATA: () => `Apply`,
  MODE_INSTANT: () => `instant mode`,
  MODE_3D: () => `3D mode`,
  APPLY_TRANSFORMATION_BTN_LABEL: () => `Apply`,
  APPLY_TRANSFORMATION_BTN_TITLE: () => `Update Vector Data`,
  SCALE_LABEL: () => `Scale`
};
