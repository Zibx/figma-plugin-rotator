export enum PROJECTION {
  ISOGRAPHIC = 2.5,
  ORTHOGRAPHIC = 3
}

export interface Transformation {
  projection: PROJECTION; // isographic vs orthographic projection
  X: number;
  Y: number;
  Z: number;
  scale: number;
}

export type CacheItem = {
  vector: VectorNode;
  transformation: Transformation;
  paths: VectorPaths;
  vectorNetwork: VectorNetwork;
};

export type PointArray = [number, number];
export type PointArray3D = [number, number, number];

export type rotateAndScalePrepareT = (x: number, y: number) => PointArray;
export type rotateAndScalePrepare3DT = (x: number, y: number, z: number) => PointArray3D;

export enum MESSAGE_TYPE {
  selection = 'selection',
  other = 'other'
}

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
export type InputValueHash = {
  [key: string]: number;
};
