import {
  PointArray,
  PointArray3D,
  PROJECTION,
  rotateAndScalePrepare3DT,
  rotateAndScalePrepareT,
  Transformation
} from '../types';

export const degToRad = function (val: number): number {
  return (val / 180) * Math.PI;
};

export const radToDeg = function (val: number): number {
  return (val * 180) / Math.PI;
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
      (Axx * x + Axy * y + Axz * z),
      (Ayx * x + Ayy * y + Ayz * z),
      (Azx * x + Azy * y + Azz * z)
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
  const side = 0.5, // square side would be half of canvas width
    scale = 0.5 * w * side; // 0.5 here is because points are from -1 to 1 like in game engines

  x = (x * localScale) / (1 - z / 3) + w / 2;
  y = (y * localScale) / (1 - z / 3) + h / 2;
  return [x, y, z];
};

const relative2D = function (
  [x, y, z = 0]: PointArray | PointArray3D,
  [w, h]: PointArray = [179, 172],
  localScale = 1
): PointArray3D {
  const side = 0.5, // square side would be half of canvas width
    scale = 0.5 * w * side; // 0.5 here is because points are from -1 to 1 like in game engines

  x = x * localScale + w / 2;
  y = y * localScale + h / 2;
  return [x, y, z];
};

export const rotateAndScalePreparePoint = function (
  inputValues: Transformation
): (point: PointArray) => [number, number] {
  const transformFn = rotateAndScalePrepare(inputValues);

  return function (point: PointArray) {
    return transformFn(point[0], point[1]);
  };
};

interface ObjectWithCoordinates {
  x: number;
  y: number;
}
export const rotateAndScalePrepareObject = function (
  inputValues: Transformation
): (point: ObjectWithCoordinates) => ObjectWithCoordinates {
  const transformFn = rotateAndScalePrepare(inputValues);

  return function (point: ObjectWithCoordinates): ObjectWithCoordinates {
    const result = transformFn(point.x, point.y);
    return Object.assign({}, point, {x: result[0], y: result[1]});
  };
};
