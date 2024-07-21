import {Transformation} from '../types';
import {copyNode, copyNodeStyle, getVectorData} from './copyNode';
import {Point} from '../util/Point';
import {INITIAL_VALUES, POSITIONS} from '../constants/consts';

const selectionMap = new WeakMap<BaseNode, CacheItem>();
const originalNodesMap = new WeakMap<BaseNode, string>();

const SPAWN_OFFSET = 16;

const SPAWN_AT = 'RIGHT';
const NEW_POSITION_X = POSITIONS[SPAWN_AT][0];
const NEW_POSITION_Y = POSITIONS[SPAWN_AT][1];

export type CacheItem = {
  originalID: string;
  copyID: string;
  vector: VectorNode;
  transformation: Transformation;
  paths: VectorPaths;
  vectorNetwork: VectorNetwork;
  position: Point;
  size: Point;
};

export async function onlyGetCachedNode(
  originalNode: SceneNode & DefaultShapeMixin
): Promise<CacheItem | false> {
  let cached: CacheItem;
  if (selectionMap.has(originalNode)) {
    cached = selectionMap.get(originalNode) as CacheItem;
    if (!cached.vector.removed) {
      return cached;
    }
  }
  return false;
}

export async function updateCahcedNode(vector: VectorNode): Promise<CacheItem | false> {
  const cache = await onlyGetCachedNode(vector);
  if (!cache) {
    return false;
  }

  const node: BaseNode | null = await figma.getNodeByIdAsync(cache.originalID);

  if (!node) {
    return false;
  }

  copyNodeStyle(vector, node as SceneNode & DefaultShapeMixin);
  const selectionPaths = getVectorData(node as SceneNode & DefaultShapeMixin);

  if (!selectionPaths) {
    return false;
  }

  const cached = await getCachedNode(vector, {...INITIAL_VALUES});

  if (!cached) {
    return false;
  }

  if (node.type === 'VECTOR') {
    await vector.setVectorNetworkAsync(node.vectorNetwork);
  }

  const cachedNew: CacheItem = {
    originalID: cached.originalID,
    copyID: cached.copyID,
    vector: vector,
    transformation: cached.transformation,
    paths: selectionPaths,
    vectorNetwork: {vertices: [], segments: []}, //copy.vectorNetwork,
    position: cached.position,
    size: cached.size
  };

  vector.setPluginData(
    'rotatorInit',
    JSON.stringify({
      originalID: cached.originalID,
      copyID: cached.copyID,
      paths: selectionPaths,
      position: cached.position,
      size: cached.size
    })
  );

  selectionMap.set(vector, cachedNew);

  return cachedNew;
}

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

  copyResult.copy.setRelaunchData({rotate: 'Rotate shape'});

  const {copy, paths} = copyResult;

  figma.currentPage.appendChild(copy);
  figma.currentPage.selection = [copy];

  copy.x = originalNode.x + (originalNode.width + SPAWN_OFFSET) * NEW_POSITION_X;
  copy.y =
    originalNode.y +
    (originalNode.height + SPAWN_OFFSET) * NEW_POSITION_Y -
    (NEW_POSITION_Y === 0 ? (copy.height - originalNode.height) / 2 : 0);

  cached = {
    originalID: originalNode.id,
    copyID: copy.id,
    vector: copy,
    transformation: transformation,
    paths: paths,
    vectorNetwork: {vertices: [], segments: []}, //copy.vectorNetwork,
    position: new Point(originalNode.x, originalNode.y),
    size: new Point(originalNode.width, originalNode.height)
  };

  originalNodesMap.set(copy, originalNode.id);

  copy.setPluginData(
    'rotatorInit',
    JSON.stringify({
      originalID: cached.originalID,
      copyID: cached.copyID,
      paths: cached.paths,
      position: cached.position,
      size: cached.size
    })
  );

  selectionMap.set(copy, cached);
  return cached;
}

export function getOriginalDataID(node: BaseNode): string {
  if (originalNodesMap.has(node)) {
    return originalNodesMap.get(node) || '';
  }
  return '';
}

export async function getCachedTransformation(
  originalNode: BaseNode
): Promise<Transformation | undefined> {
  if (selectionMap.has(originalNode)) {
    return selectionMap.get(originalNode)?.transformation;
  } else {
    const storedTransformation = originalNode.getPluginData('rotator');
    if (storedTransformation) {
      const storedInit = originalNode.getPluginData('rotatorInit');
      try {
        const initData = JSON.parse(storedInit);
        const cache: CacheItem = {
          originalID: initData.originalID,
          copyID: initData.copyID,
          vector: originalNode as VectorNode,
          transformation: JSON.parse(storedTransformation),
          paths: initData.paths,
          vectorNetwork: {vertices: [], segments: []}, //copy.vectorNetwork,
          position: new Point(initData.position.x, initData.position.y),
          size: new Point(initData.size.x, initData.size.y)
        };
        selectionMap.set(originalNode, cache);
        const resolvedOriginalNode = await figma.getNodeByIdAsync(cache.originalID);
        if (resolvedOriginalNode) {
          originalNodesMap.set(originalNode, resolvedOriginalNode.id);
        }
        return cache.transformation;
      } catch (e) {}
    }

    /*    return;
    // Maybe we have stored transformation in item
    const storedData = originalNode.getPluginData('rotator');
    if (storedData) {
      let storedTransformation: Transformation;
      try {
        storedTransformation = JSON.parse(storedData);
        const cachedItem = await getCachedNode(
          originalNode as SceneNode & DefaultShapeMixin,
          storedTransformation
        );
        if (cachedItem) {
          return cachedItem.transformation;
        }
      } catch (e) {}
    }*/
  }
}
