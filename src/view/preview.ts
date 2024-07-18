import {getContext} from '../controller/context';
import {radToDeg, rotatePrepare3D} from '../model/math';
import {Transformation} from '../types';
import {CollidePoint, drawCircleGizmo, GizmoContext} from './previewCircleGizmo';
import {debounceAnimationFrame} from '../util/debounce';
import {PROJECTION} from '../constants/consts';
import {Point} from '../util/Point';
export const AXIS_NOT_SELECTED = 'N';

const colliders: CollidePoint[] = [];
let activeGizmo = AXIS_NOT_SELECTED;

const squarePoints: Point[] = [
  new Point(-1, 1),
  new Point(1, 1),
  new Point(1, -1),
  new Point(-1, -1)
];

function strokePolyline(ctx: CanvasRenderingContext2D, points: Point[]): void {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let n = 1, _n = points.length; n < _n; n++) {
    ctx.lineTo(points[n].x, points[n].y);
  }
  ctx.stroke();
}
// update the preview
export const redraw3D = debounceAnimationFrame(
  function redraw3D(): void {
    const {ctx, canvasSize, inputValues} = getContext();
    ctx.clearRect(0, 0, canvasSize.x, canvasSize.y);

    const transform3D = rotatePrepare3D({...inputValues, scale: canvasSize.x / 4}, canvasSize);

    const localPoints: Point[] = squarePoints.map((point: Point) => transform3D(point));

    const backPartID = localPoints
      .map((point, n: number) => {
        return {point, n, z: point.z};
      })
      .sort((p1, p2) => p1.z - p2.z)[0].n;

    const backPoints = [-1, 0, 1].map(
      (n) => localPoints[(backPartID + n + squarePoints.length) % squarePoints.length]
    );

    ctx.strokeStyle = '#0c7dab';
    ctx.lineWidth = 3;
    strokePolyline(ctx, backPoints);

    const frontPoints = [-1, 0, 1].map(
      (n) =>
        localPoints[
          (backPartID + n + squarePoints.length + ((squarePoints.length / 2) | 0)) %
            squarePoints.length
        ]
    );

    colliders.length = 0;

    const context: GizmoContext = {
      ctx,
      canvasSize,
      colliders,
      transform3D: rotatePrepare3D(
        {
          X: 0,
          Y: 3,
          Z: -10,
          scale: 32,
          projection: PROJECTION.ORTHOGRAPHIC,
          instant: 1
        },
        canvasSize
      ),
      activeGizmo
    };

    drawCircleGizmo([0, 1], 'X', '#ab1d1a', context, 37);
    drawCircleGizmo([0, 2], 'Y', '#2a9a12', context);
    drawCircleGizmo([1, 2], 'Z', '#2468b6', context);

    ctx.strokeStyle = '#0c7dab';
    ctx.lineWidth = 3;
    strokePolyline(ctx, frontPoints);
  },
  15,
  false
);

// Gizmo dragging
let mousePressed = false;
const startPoint: Point = new Point();

export const previewMouseMove = function (e: MouseEvent): void {
  if (mousePressed) {
    return;
  }

  let minDistance = Infinity,
    minPoint: CollidePoint = colliders[0],
    distance;
  const mousePoint = new Point(e.offsetX, e.offsetY);

  for (let n = 0, _n = colliders.length; n < _n; n++) {
    distance = mousePoint.sub(colliders[n].point).length();

    if (distance < minDistance) {
      minDistance = distance;
      minPoint = colliders[n];
    }
  }
  if (minDistance < 5) {
    if (activeGizmo !== minPoint.axis) {
      activeGizmo = minPoint.axis;
      redraw3D();
    }
  } else if (activeGizmo !== AXIS_NOT_SELECTED) {
    activeGizmo = AXIS_NOT_SELECTED;
    redraw3D();
  }
};
export const previewMouseDown = function (e: MouseEvent): void {
  if (activeGizmo === AXIS_NOT_SELECTED) {
    return;
  }
  mousePressed = true;
  const {inputValues, updateInputValue, canvasSize} = getContext();
  const initialValue = inputValues[activeGizmo as keyof Transformation];
  const initialOffset = new Point(e.offsetX - canvasSize.x / 2, e.offsetY - canvasSize.y / 2);

  startPoint.x = e.clientX;
  startPoint.y = e.clientY;

  const windowMoveHandler = (e: MouseEvent) => {
    const delta = startPoint.sub(e.clientX, e.clientY);
    let newVal = initialValue;
    if (activeGizmo === 'Y') {
      newVal += -delta.x;
    } else if (activeGizmo === 'Z') {
      newVal += delta.y;
    } else {
      newVal = radToDeg(initialOffset.atan2() - initialOffset.sub(delta).atan2()) + initialValue;
    }

    updateInputValue(activeGizmo as keyof Transformation, Math.round(newVal) % 360);
    redraw3D();
    e.stopPropagation();
    e.preventDefault();
  };
  const windowUpHandler = (): void => {
    mousePressed = false;
    window.removeEventListener('mousemove', windowMoveHandler);
    window.removeEventListener('mouseup', windowUpHandler);
  };

  window.addEventListener('mousemove', windowMoveHandler);
  window.addEventListener('mouseup', windowUpHandler);
};
