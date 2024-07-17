import {getDomCtx} from './dom';
import {degToRad, radToDeg, rotatePrepare3D} from '../model/math';
import {PointArray, PointArray3D, PROJECTION, Transformation} from '../types';
import {CollidePoint, drawCircleGizmo, GizmoContext} from './previewCircleGizmo';
export const AXIS_NOT_SELECTED = 'N';

const colliders: CollidePoint[] = [];
let activeGizmo = AXIS_NOT_SELECTED;

const squarePoints: PointArray3D[] = [
  [-1, 1, 0],
  [1, 1, 0],
  [1, -1, 0],
  [-1, -1, 0]
];

// update the preview
export function redraw3D(): void {
  const {ctx, canvasSize, inputValues} = getDomCtx();
  ctx.clearRect(0, 0, canvasSize[0], canvasSize[1]);

  //  const transformFn = rotateAndScalePreparePoint(inputValues);
  const transform3D = rotatePrepare3D({...inputValues, scale: canvasSize[0] / 4}, canvasSize);

  let relativePoint = transform3D(...squarePoints[0]);

  // draw transformed square
  ctx.beginPath();
  ctx.moveTo(relativePoint[0], relativePoint[1]);
  for (let n = 0, _n = squarePoints.length; n < _n; n++) {
    relativePoint = transform3D(...squarePoints[(n + 1) % _n]);
    ctx.lineTo(relativePoint[0], relativePoint[1]);
  }
  ctx.closePath();
  ctx.strokeStyle = '#0c7dab';
  ctx.lineWidth = 3;
  ctx.stroke();

  colliders.length = 0;

  const context: GizmoContext = {
    ctx,
    canvasSize,
    colliders,
    transform3D: rotatePrepare3D(
      {
        X: 0,
        Y: 0,
        Z: 10,
        scale: 32,
        projection: PROJECTION.ORTHOGRAPHIC
      },
      canvasSize
    ),
    activeGizmo
  };

  drawCircleGizmo([0, 1], 'X', '#a80d0d', context, 37);
  drawCircleGizmo([0, 2], 'Y', '#2a9a12', context);
  drawCircleGizmo([1, 2], 'Z', '#15a0b7', context);
}

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
  const {inputValues, updateInputValue, canvasSize} = getDomCtx();
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
