import {transformPath} from '../util/vectorPathsTransform';
import {Point} from '../util/Point';
import {CacheItem} from './getCachedNode';

export function updateVector(cached: CacheItem): void {
  const vector = cached.vector;

  const {width, height, x, y} = vector;
  vector.vectorPaths = transformPath(
    cached.paths,
    cached.transformation,
    new Point(cached.size.x, cached.size.y)
  );

  // Reposition the vector after the transformation, so the center stays in the same position
  vector.x = x + width / 2 - vector.width / 2;
  vector.y = y + height / 2 - vector.height / 2;

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
