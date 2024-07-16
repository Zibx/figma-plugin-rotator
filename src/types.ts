export interface Transformation {
  X: number;
  Y: number;
  Z: number;
  scale: number;
}

export type CacheItem = {
  vector: VectorNode;
  transformation: Transformation;
  paths: VectorPaths;
};

export type PointArray = [number, number];

export type rotateAndScalePrepareT = (x: number, y: number) => PointArray;

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