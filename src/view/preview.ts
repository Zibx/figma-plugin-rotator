import {getDomCtx} from './dom';
import {rotateAndScalePreparePoint} from '../math';
import {PointArray} from '../types';

const relative = function ([x, y]: PointArray, [w, h]: PointArray): PointArray {
  const side = 0.5, // square side would be half of canvas width
    scale = 0.5 * w * side; // 0.5 here is because points are from -1 to 1 like in game engines

  x = x * scale + w / 2;
  y = y * scale + h / 2;
  return [x, y];
};

// update the preview
export function redraw3D(): void {
  const {ctx, canvasSize, inputValues} = getDomCtx();
  ctx.clearRect(0, 0, canvasSize[0], canvasSize[1]);
  const points: PointArray[] = [
    [-1, 1],
    [1, 1],
    [1, -1],
    [-1, -1]
  ];

  const transformFn = rotateAndScalePreparePoint(inputValues);

  let relativePoint = relative(transformFn(points[0]), canvasSize);

  ctx.beginPath();
  ctx.moveTo(relativePoint[0], relativePoint[1]);
  for (let n = 0, _n = points.length; n < _n; n++) {
    relativePoint = relative(transformFn(points[(n + 1) % _n]), canvasSize);
    ctx.lineTo(relativePoint[0], relativePoint[1]);
  }
  ctx.closePath();
  ctx.strokeStyle = '#0c7dab';
  ctx.lineWidth = 3;
  ctx.stroke();
}
