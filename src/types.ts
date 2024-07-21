import {MESSAGE_TYPE, PROJECTION, UPDATE_MODE} from './constants/consts';
import {Point} from './util/Point';

export type Transformation = {
  [key: string]: number;
  instant: UPDATE_MODE;
  X: number;
  Y: number;
  Z: number;
  scale: number;
  projection: PROJECTION; // isographic vs orthographic projection
};

export type rotateAndScalePrepare3DT = (point: Point) => Point;

export interface BasicMessage {
  type: MESSAGE_TYPE;
}

export interface SelectionMessage extends BasicMessage {
  supported: boolean;
  amount: number;
  shapeType: string;
  transformation: Transformation | undefined;
}

export interface UpdateMessage extends BasicMessage {
  originalID: string;
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
