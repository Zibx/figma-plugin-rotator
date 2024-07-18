import {rotateAndScalePrepare3DT} from '../types';
import {Point} from '../util/Point';

const GIZMO_BOLD_LINE = 4;
const GIZMO_THIN_LINE = 2;

export type CollidePoint = {
  point: Point;
  axis: string;
};

export type GizmoContext = {
  ctx: CanvasRenderingContext2D;
  canvasSize: Point;
  colliders: CollidePoint[];
  transform3D: rotateAndScalePrepare3DT;
  activeGizmo: string;
};

export function drawCircleGizmo(
  axisOrder: number[],
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
    const initialPoint = new Point();
    initialPoint.set(axisOrder[0], Math.cos((n / 18) * Math.PI));
    initialPoint.set(axisOrder[1], Math.sin((n / 18) * Math.PI));

    const point: Point = transform3D(initialPoint);

    colliders.push({point: point, axis: axisName});

    ctx[n === 0 ? 'moveTo' : 'lineTo'](point.x, point.y);
  }
  //ctx.closePath();
  ctx.strokeStyle = color;
  ctx.stroke();
}
