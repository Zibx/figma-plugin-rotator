export async function copyNode(
  node: SceneNode & DefaultShapeMixin
): Promise<{copy: VectorNode; paths: VectorPaths} | false> {
  const NodeType = node.type;
  let vector: VectorNode;
  if (NodeType === 'TEXT') {
    vector = figma.flatten([node.clone()], figma.currentPage);
  } else {
    vector = figma.createVector();
  }

  vector.fills = node.fills;

  // copy stroke style
  vector.strokes = node.strokes;
  vector.strokeAlign = node.strokeAlign;
  // vector.strokeCap = currentSelection.strokeCap;
  vector.strokeJoin = node.strokeJoin;
  vector.strokeMiterLimit = node.strokeMiterLimit;
  vector.strokeWeight = node.strokeWeight;
  vector.dashPattern = node.dashPattern;

  let selectionPaths: VectorPaths;

  // it may be a good idea to tune SUPPORTED_TYPES in a way that
  // value would specify the approach of getting path data

  if (NodeType === 'VECTOR') {
    selectionPaths = (node as VectorNode).vectorPaths;
    await vector.setVectorNetworkAsync(node.vectorNetwork);
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
  return {copy: vector, paths: selectionPaths};
}
