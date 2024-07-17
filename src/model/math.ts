import {PointArray, PointArray3D, rotateAndScalePrepare3DT, Transformation} from '../types';
import {PROJECTION} from '../constants/consts';

export const degToRad = function (val: number): number {
  return (val / 180) * Math.PI;
};

export const radToDeg = function (val: number): number {
  return (val * 180) / Math.PI;
};

export const rotatePrepare3D = function (
  inputValues: Transformation,
  canvasSize: PointArray
): rotateAndScalePrepare3DT {
  const rotateX = degToRad(inputValues.X),
    rotateY = degToRad(inputValues.Y),
    rotateZ = degToRad(inputValues.Z),
    scale = inputValues.scale;

  const cosa = Math.cos(rotateX);
  const sina = Math.sin(rotateX);

  const cosb = Math.cos(rotateY);
  const sinb = Math.sin(rotateY);

  const Axx = cosa * cosb;

  const cosc = Math.cos(rotateZ);
  const sinc = Math.sin(rotateZ);

  const Axy = cosa * sinb * sinc - sina * cosc;
  const Axz = cosa * sinb * cosc + sina * sinc;

  const Ayx = sina * cosb;
  const Ayy = sina * sinb * sinc + cosa * cosc;
  const Ayz = sina * sinb * cosc - cosa * sinc;

  const Azx = -sinb;
  const Azy = cosb * sinc;
  const Azz = cosb * cosc;

  return function (x, y, z) {
    const result: PointArray3D = [
      Axx * x + Axy * y + Axz * z,
      Ayx * x + Ayy * y + Ayz * z,
      Azx * x + Azy * y + Azz * z
    ];

    if (inputValues.projection === PROJECTION.ISOGRAPHIC) {
      return relative2D(result, canvasSize, scale);
    }

    return relative3D(result, canvasSize, scale);
  };
};

const relative3D = function (
  [x, y, z = 0]: PointArray | PointArray3D,
  [w, h]: PointArray,
  localScale = 1
): PointArray3D {
  x = (x * localScale) / (1 - z / 3) + w / 2;
  y = (y * localScale) / (1 - z / 3) + h / 2;
  return [x, y, z];
};

const relative2D = function (
  [x, y, z = 0]: PointArray | PointArray3D,
  [w, h]: PointArray = [179, 172],
  localScale = 1
): PointArray3D {
  x = x * localScale + w / 2;
  y = y * localScale + h / 2;
  return [x, y, z];
};
