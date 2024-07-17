import {MESSAGE_TYPE, PROJECTION, UPDATE_MODE} from './constants/consts';

export type Transformation = {
  [key: string]: number;
  instant: UPDATE_MODE;
  X: number;
  Y: number;
  Z: number;
  scale: number;
  projection: PROJECTION; // isographic vs orthographic projection
};

export type CacheItem = {
  vector: VectorNode;
  transformation: Transformation;
  paths: VectorPaths;
  vectorNetwork: VectorNetwork;
};

export type PointArray = [number, number];
export type PointArray3D = [number, number, number];

export type rotateAndScalePrepare3DT = (x: number, y: number, z: number) => PointArray3D;

export interface BasicMessage {
  type: MESSAGE_TYPE;
}

export interface SelectionMessage extends BasicMessage {
  supported: boolean;
  amount: number;
  shapeType: string;
}

export type PluginMessage = {
  pluginMessage: SelectionMessage;
};

export type LocalizeFunction = (payload?: SelectionMessage) => string;

export type LocaleTable = {
  [key: string]: LocalizeFunction;
};

export type HTMLElementHash = {
  [key: string]: HTMLElement;
};
export type InputHash = {
  [key: string]: HTMLInputElement;
};
