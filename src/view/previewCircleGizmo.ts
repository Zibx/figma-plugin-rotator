import {PointArray, PointArray3D, rotateAndScalePrepare3DT} from '../types';

const GIZMO_BOLD_LINE = 4;
const GIZMO_THIN_LINE = 2;

export type CollidePoint = {
  point: PointArray3D;
  axis: string;
};

export type GizmoContext = {
  ctx: CanvasRenderingContext2D;
  canvasSize: PointArray;
  colliders: CollidePoint[];
  transform3D: rotateAndScalePrepare3DT;
  activeGizmo: string;
};

export function drawCircleGizmo(
  axisOrder: PointArray,
  axisName: string,
  color: string,
  context: GizmoContext,
  points = 19
): void {
  const {
    // drawing context
    ctx,
    colliders,
    transform3D,
    activeGizmo
  } = context;

  ctx.lineWidth = axisName === activeGizmo ? GIZMO_BOLD_LINE : GIZMO_THIN_LINE;
  ctx.beginPath();
  for (let n = 0, _n = points; n < _n; n++) {
    const initialPoint: PointArray3D = [0, 0, 0];
    initialPoint[axisOrder[0]] = Math.cos((n / 18) * Math.PI);
    initialPoint[axisOrder[1]] = Math.sin((n / 18) * Math.PI);

    const point: PointArray3D = transform3D(...initialPoint);

    colliders.push({point: point, axis: axisName});

    ctx[n === 0 ? 'moveTo' : 'lineTo'](point[0], point[1]);
  }
  //ctx.closePath();
  ctx.strokeStyle = color;
  ctx.stroke();
}
