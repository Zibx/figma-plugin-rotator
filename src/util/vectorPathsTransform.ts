import {PointArray, PointArray3D, Transformation} from '../types';
import {rotatePrepare3D} from '../model/math';

export const transformPath = function (
  vectorPaths: VectorPaths,
  transformation: Transformation,
  widthHeight: PointArray
): VectorPaths {
  const transformFn = rotatePrepare3D(transformation, widthHeight);

  const halfWidth = widthHeight[0] / 2;
  const halfHeight = widthHeight[1] / 2;

  return vectorPaths.map((path) => {
    const newData = path.data.replace(/([ZCQML])([\d.])/g, '$1 $2').split(' ');
    let point: PointArray3D = [0, 0, 0],
      pointPointer = 0;

    for (let i = 0, _i = newData.length; i < _i; i++) {
      const token = newData[i];
      if (!token) continue;
      if (token === 'Z' || token === 'C' || token === 'Q' || token === 'M' || token === 'L') {
        continue;
      }

      point[pointPointer] = parseFloat(token);
      pointPointer++;
      if (pointPointer === 2) {
        point = transformFn(
          (point[0] - halfWidth) / halfWidth,
          (point[1] - halfHeight) / halfHeight,
          0
        );
        newData[i - 1] = ((point[0] + halfWidth) * halfWidth).toString();
        newData[i] = ((point[1] + halfHeight) * halfHeight).toString();

        pointPointer = 0;
      }
    }

    // debugger
    return {
      data: newData.join(' '),
      windingRule: path.windingRule
    };
  });
};
