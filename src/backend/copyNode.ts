export function copyNodeStyle(vector: VectorNode, node: SceneNode & DefaultShapeMixin): void {
  if (node.fills !== figma.mixed) {
    vector.fills = node.fills;
  }

  // copy stroke style
  vector.strokes = node.strokes;
  vector.strokeAlign = node.strokeAlign;
  // vector.strokeCap = currentSelection.strokeCap;
  vector.strokeJoin = node.strokeJoin;
  vector.strokeMiterLimit = node.strokeMiterLimit;
  vector.strokeWeight = node.strokeWeight;
  vector.dashPattern = node.dashPattern;
}
export function getVectorData(node: SceneNode & DefaultShapeMixin): VectorPaths | false {
  const NodeType = node.type;

  let selectionPaths: VectorPaths;

  if (NodeType === 'VECTOR') {
    selectionPaths = (node as VectorNode).vectorPaths;
  } else if (
    NodeType === 'RECTANGLE' ||
    NodeType === 'ELLIPSE' ||
    NodeType === 'STAR' ||
    NodeType === 'POLYGON'
  ) {
    selectionPaths = node.fillGeometry;
  } else if (NodeType === 'TEXT') {
    selectionPaths = node.fillGeometry;
  } else {
    console.warn('Unsupported node type:', NodeType);
    return false;
  }
  return selectionPaths;
}
export async function copyNode(
  node: SceneNode & DefaultShapeMixin
): Promise<{copy: VectorNode; paths: VectorPaths} | false> {
  const vector = figma.flatten([node.clone()], figma.currentPage);
  copyNodeStyle(vector, node);
  const selectionPaths = getVectorData(node);
  if (node.type === 'VECTOR') {
    await vector.setVectorNetworkAsync(node.vectorNetwork);
  }

  // it may be a good idea to tune SUPPORTED_TYPES in a way that
  // value would specify the approach of getting path data
  if (!selectionPaths) {
    vector.remove();
    return false;
  }
  return {copy: vector, paths: selectionPaths};
}
