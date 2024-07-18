import {transformPath} from '../util/vectorPathsTransform';
import {Point} from '../util/Point';
import {POSITIONS} from '../constants/position';
import {CacheItem} from './getCachedNode';

const SPAWN_OFFSET = 16;

const SPAWN_AT = 'RIGHT';
const NEW_POSITION_X = POSITIONS[SPAWN_AT][0];
const NEW_POSITION_Y = POSITIONS[SPAWN_AT][1];

export function updateVector(cached: CacheItem): void {
  const vector = cached.vector;

  vector.vectorPaths = transformPath(
    cached.paths,
    cached.transformation,
    new Point(cached.size.x, cached.size.y)
  );

  vector.x = cached.position.x + (cached.size.x + SPAWN_OFFSET) * NEW_POSITION_X;
  vector.y =
    cached.position.y +
    (cached.size.y + SPAWN_OFFSET) * NEW_POSITION_Y -
    (NEW_POSITION_Y === 0 ? (vector.height - cached.size.y) / 2 : 0);

  // VECTOR NETWORK APPROACH
  //const transformFn = rotateAndScalePrepareObject(msg.data);
  /*await vector.setVectorNetworkAsync({
    regions: cached.vectorNetwork.regions,
    segments: cached.vectorNetwork.segments.map((segment: VectorSegment) => ({
      start: segment.start,
      end: segment.end,
      tangentEnd: segment.tangentEnd && transformFn(segment.tangentEnd),
      tangentStart: segment.tangentStart && transformFn(segment.tangentStart)
    })),
    vertices: cached.vectorNetwork.vertices.map(transformFn)
  });*/
}
