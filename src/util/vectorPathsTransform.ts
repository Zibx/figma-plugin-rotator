import {Transformation} from '../types';
import {rotatePrepare3D} from '../model/math';
import {Point} from './Point';
import {PROJECTION} from '../constants/consts';

export const transformPath = function (
  vectorPaths: VectorPaths,
  transformation: Transformation,
  canvasSize: Point
): VectorPaths {
  const transformFn = rotatePrepare3D(transformation, canvasSize);

  const halfWidth = canvasSize.x / 2;
  const halfHeight = canvasSize.y / 2;
  const half = new Point(halfWidth, halfHeight);

  return vectorPaths.map((path) => {
    const newData = path.data.replace(/([ZCQML])([\d.])/g, '$1 $2').split(' ');
    let point = new Point(),
      pointPointer = 0;

    for (let i = 0, _i = newData.length; i < _i; i++) {
      const token = newData[i];
      if (!token) continue;

      if (token === 'Z' || token === 'C' || token === 'Q' || token === 'M' || token === 'L') {
        continue;
      }
      if (pointPointer === 0) {
        point.x = parseFloat(token);
      } else {
        point.y = parseFloat(token);
      }
      pointPointer++;
      if (pointPointer === 2) {
        point.z = 0;
        point = point.sub(half);
        if (transformation.projection === PROJECTION.ORTHOGRAPHIC){
          point = point.div(half.x, half.y);
        }
        point = transformFn(point);
        point = point.add(half);
        if (transformation.projection === PROJECTION.ORTHOGRAPHIC){
          point = point.mul(half.x, half.y);
        }
        newData[i - 1] = point.x.toString();
        newData[i] = point.y.toString();

        pointPointer = 0;
      }
    }

    return {
      data: newData.join(' '),
      windingRule: path.windingRule
    };
  });
};
