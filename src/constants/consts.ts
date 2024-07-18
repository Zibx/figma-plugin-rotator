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
  OTHER = 'OTHER'
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
