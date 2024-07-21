import {Transformation} from '../types';
import {rotatePrepare3D} from './math';
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

  let minX = Infinity,
    minY = Infinity;

  return vectorPaths
    .map((path) => {
      const newData = path.data.replace(/([ZCQML])([\d.\-+])/g, '$1 $2').split(' ');
      let point = new Point(),
        pointPointer = 0;

      const changes: {i: number; p: Point}[] = [];

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
          if (transformation.projection === PROJECTION.ORTHOGRAPHIC) {
            point = point.div(half.x, half.y);
            point = transformFn(point);
          } else {
            point = transformFn(point);
          }

          point = point.add(half);
          if (transformation.projection === PROJECTION.ORTHOGRAPHIC) {
            point = point.mul(half.x, half.y);
          }
          changes.push({i: i - 1, p: point.clone()});
          if (point.x < minX) {
            minX = point.x;
          }
          if (point.y < minY) {
            minY = point.y;
          }

          pointPointer = 0;
        }
      }

      return {
        newData,
        changes,
        windingRule: path.windingRule
      };
    })
    .map(({newData, windingRule, changes}) => {
      for (let i = 0, _i = changes.length; i < _i; i++) {
        const change = changes[i];
        newData[change.i] = (change.p.x - minX).toString();
        newData[change.i + 1] = (change.p.y - minY).toString();
      }
      return {
        data: newData.join(' '),
        windingRule
      };
    });
};
