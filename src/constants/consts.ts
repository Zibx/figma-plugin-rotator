import {Transformation} from '../types';

export enum PROJECTION {
  ISOGRAPHIC = 2.5,
  ORTHOGRAPHIC = 3
}

export enum UPDATE_MODE {
  MANUAL = 0,
  INSTANT = 1
}

export enum MESSAGE_TYPE {
  SELECTION = 'SELECTION',
  OTHER = 'OTHER',
  ORIGINAL_PATH_UPDATED = 'ORIGINAL_PATH_UPDATED',
  APPLY_TRANSFORMATION = 'APPLY_TRANSFORMATION',
  UPDATE_PATH_DATA = 'UPDATE_PATH_DATA'
}

export enum SUPPORTED_TYPES {
  VECTOR = 1,
  RECTANGLE = 2,
  ELLIPSE = 3,
  STAR = 4,
  POLYGON = 5,
  TEXT = 6
}

export const INITIAL_VALUES: Transformation = {
  X: 0,
  Y: 0,
  Z: 0,
  scale: 1,
  projection: PROJECTION.ORTHOGRAPHIC,
  instant: UPDATE_MODE.MANUAL
};

export const POSITIONS = {
  RIGHT: [1, 0],
  LEFT: [-1, 0],
  TOP: [0, -1],
  BOTTOM: [0, 1]
};