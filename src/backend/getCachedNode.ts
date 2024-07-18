import {Transformation} from '../types';
import {copyNode} from './copyNode';
import {Point} from '../util/Point';

const selectionMap = new WeakMap<BaseNode, CacheItem>();

export type CacheItem = {
  vector: VectorNode;
  transformation: Transformation;
  paths: VectorPaths;
  vectorNetwork: VectorNetwork;
  position: Point;
  size: Point;
};

export async function getCachedNode(
  originalNode: SceneNode & DefaultShapeMixin,
  transformation: Transformation
): Promise<CacheItem | false> {
  let cached: CacheItem;

  if (selectionMap.has(originalNode)) {
    cached = selectionMap.get(originalNode) as CacheItem;
    if (!cached.vector.removed) {
      return cached;
    }
  }

  const copyResult = await copyNode(originalNode);

  if (!copyResult) {
    return false;
  }

  const {copy, paths} = copyResult;

  figma.currentPage.appendChild(copy);

  cached = {
    vector: copy,
    transformation: transformation,
    paths: paths,
    vectorNetwork: copy.vectorNetwork,
    position: new Point(originalNode.x, originalNode.y),
    size: new Point(originalNode.width, originalNode.height)
  };
  selectionMap.set(originalNode, cached);
  return cached;
}

export function getCachedTransformation(originalNode: BaseNode): Transformation | undefined {
  if (selectionMap.has(originalNode)) {
    return selectionMap.get(originalNode)?.transformation;
  }
}
