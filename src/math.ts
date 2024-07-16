import {PointArray, rotateAndScalePrepareT, Transformation} from './types';

export const degToRad = function (val: number) {
  return (val / 180) * Math.PI;
};

export const rotateAndScalePrepare = function (
  inputValues: Transformation
): rotateAndScalePrepareT {
  const rotateX = degToRad(inputValues.X),
    rotateY = degToRad(inputValues.Y),
    rotateZ = degToRad(inputValues.Z),
    scale = inputValues.scale;

  const cosa = Math.cos(rotateX);
  const sina = Math.sin(rotateX);

  const cosb = Math.cos(rotateY);
  const sinb = Math.sin(rotateY);

  const cosc = Math.cos(rotateZ);
  const sinc = Math.sin(rotateZ);

  const Axx = cosa * cosb;
  const Axy = cosa * sinb * sinc - sina * cosc;

  const Ayx = sina * cosb;
  const Ayy = sina * sinb * sinc + cosa * cosc;

  return function (x, y) {
    return [(Axx * x + Axy * y) * scale, (Ayx * x + Ayy * y) * scale];
  };
};

export const rotateAndScalePreparePoint = function (inputValues: Transformation) {
  const transformFn = rotateAndScalePrepare(inputValues);

  return function (point: PointArray) {
    return transformFn(point[0], point[1]);
  };
};
