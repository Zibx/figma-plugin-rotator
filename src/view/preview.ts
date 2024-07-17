import {getContext} from '../controller/context';
import {degToRad, radToDeg, rotatePrepare3D} from '../model/math';
import {PointArray, PointArray3D, Transformation} from '../types';
import {CollidePoint, drawCircleGizmo, GizmoContext} from './previewCircleGizmo';
import {debounceAnimationFrame} from '../util/debounce';
import {PROJECTION} from '../constants/consts';
export const AXIS_NOT_SELECTED = 'N';

const colliders: CollidePoint[] = [];
let activeGizmo = AXIS_NOT_SELECTED;

const squarePoints: PointArray3D[] = [
  [-1, 1, 0],
  [1, 1, 0],
  [1, -1, 0],
  [-1, -1, 0]
];

function strokePolyline(ctx: CanvasRenderingContext2D, points: PointArray3D[]): void {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let n = 1, _n = points.length; n < _n; n++) {
    ctx.lineTo(points[n][0], points[n][1]);
  }
  ctx.stroke();
}
// update the preview
export const redraw3D = debounceAnimationFrame(
  function redraw3D(): void {
    const {ctx, canvasSize, inputValues} = getContext();
    ctx.clearRect(0, 0, canvasSize[0], canvasSize[1]);

    const transform3D = rotatePrepare3D({...inputValues, scale: canvasSize[0] / 4}, canvasSize);

    const localPoints: PointArray3D[] = squarePoints.map((point: PointArray3D) =>
      transform3D(...point)
    );

    const backPartID = localPoints
      .map((point, n: number) => {
        return {point, n, z: point[2]};
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
const startPoint: PointArray = [0, 0];

export const previewMouseMove = function (e: MouseEvent): void {
  if (mousePressed) {
    return;
  }

  let minDistance = Infinity,
    minPoint: CollidePoint = colliders[0],
    distance;
  const mousePoint = [e.offsetX, e.offsetY];

  for (let n = 0, _n = colliders.length; n < _n; n++) {
    distance = Math.hypot(
      mousePoint[0] - colliders[n].point[0],
      mousePoint[1] - colliders[n].point[1]
    );
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
  const initialOffset: PointArray = [e.offsetX - canvasSize[0] / 2, e.offsetY - canvasSize[1] / 2];

  console.log(activeGizmo, initialValue);

  startPoint[0] = e.clientX;
  startPoint[1] = e.clientY;

  const windowMoveHandler = (e: MouseEvent) => {
    const delta: PointArray = [startPoint[0] - e.clientX, startPoint[1] - e.clientY];
    let newVal = initialValue;
    if (activeGizmo === 'Y') {
      newVal += -delta[0];
    } else if (activeGizmo === 'Z') {
      newVal += delta[1];
    } else {
      newVal = radToDeg(
        Math.atan2(...initialOffset) -
          Math.atan2(initialOffset[0] - delta[0], initialOffset[1] - delta[1]) +
          degToRad(initialValue)
      );
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
