import {POSITIONS} from './constants/position';
import {CacheItem, PointArray, rotateAndScalePrepareT, Transformation} from './types';
import {rotateAndScalePrepare} from './math';

const SPAWN_OFFSET = 16;

const SPAWN_AT = 'RIGHT';
const NEW_POSITION_X = POSITIONS[SPAWN_AT][0];
const NEW_POSITION_Y = POSITIONS[SPAWN_AT][1];

let currentSelection: SceneNode & DefaultShapeMixin;

const transformPath = function (
  vectorPaths: VectorPaths,
  transformFn: rotateAndScalePrepareT
): VectorPaths {
  return vectorPaths.map((path) => {
    const newData = path.data.replace(/([ZCQML])([\d.])/g, '$1 $2').split(' ');
    let point: PointArray = [0, 0],
      pointPointer = 0;

    for (let i = 0, _i = newData.length; i < _i; i++) {
      const token = newData[i];
      if (!token) continue;
      if (token === 'Z' || token === 'C' || token === 'Q' || token === 'M' || token === 'L') {
        continue;
      }

      point[pointPointer] = parseFloat(token);
      pointPointer++;
      if (pointPointer === 2) {
        point = transformFn(point[0], point[1]);
        newData[i - 1] = point[0].toString();
        newData[i] = point[1].toString();

        pointPointer = 0;
      }
    }


    // debugger
    return {
      data: newData.join(' '),
      windingRule: path.windingRule
    };
  });
};

const selectionMap = new WeakMap<BaseNode, CacheItem>();
// Runs this code if the plugin is run in Figma
if (figma.editorType === 'figma') {
  // Render plugin HTML
  figma.showUI(__html__, {themeColors: true});
  figma.ui.resize(300, 220);

  // Messages processing
  figma.ui.onmessage = (msg: {data: Transformation; type: string; instant: boolean}) => {
    if (msg.type === 'apply-transformation') {
      let createNewVector = false,
        cached: CacheItem;

      if (!selectionMap.has(currentSelection)) {
        createNewVector = true;
      } else {
        cached = selectionMap.get(currentSelection) as CacheItem;
        if (cached.vector.removed) {
          createNewVector = true;
        }
      }

      let vector: VectorNode;
      // Create new vector if it is the first call
      if (createNewVector) {
        const NodeType = currentSelection.type;
        if (NodeType === 'TEXT') {
          vector = figma.flatten([currentSelection.clone()], figma.currentPage);
        } else {
          vector = figma.createVector();
        }

        vector.fills = currentSelection.fills;

        // copy stroke style
        vector.strokes = currentSelection.strokes;
        vector.strokeAlign = currentSelection.strokeAlign;
        vector.strokeCap = currentSelection.strokeCap;
        vector.strokeJoin = currentSelection.strokeJoin;
        vector.strokeMiterLimit = currentSelection.strokeMiterLimit;
        vector.strokeWeight = currentSelection.strokeWeight;
        vector.dashPattern = currentSelection.dashPattern;

        let selectionPaths: VectorPaths;

        if (NodeType === 'VECTOR') {
          selectionPaths = (currentSelection as VectorNode).vectorPaths;
        } else if (
          NodeType === 'RECTANGLE' ||
          NodeType === 'ELLIPSE' ||
          NodeType === 'STAR' ||
          NodeType === 'POLYGON'
        ) {
          selectionPaths = currentSelection.fillGeometry;
        } else if (NodeType === 'TEXT') {
          selectionPaths = currentSelection.fillGeometry;
        } else {
          console.warn('Unsupported node type:', NodeType);
          return false;
        }

        figma.currentPage.appendChild(vector);

        debugger;
        cached = {
          vector,
          transformation: msg.data,
          paths: selectionPaths
        };
        selectionMap.set(currentSelection, cached);
      }

      cached = selectionMap.get(currentSelection) as CacheItem;

      vector = cached.vector;
      cached.transformation = msg.data;

      // console.log(vector.vectorNetwork);
      //console.log(currentSelection.vectorNetwork);

      //vector.vectorNetwork = currentSelection.vectorNetwork

      const transformFn = rotateAndScalePrepare(msg.data);
      vector.vectorPaths = transformPath(cached.paths, transformFn);

      vector.x = currentSelection.x + (currentSelection.width + SPAWN_OFFSET) * NEW_POSITION_X;
      vector.y =
        currentSelection.y +
        (currentSelection.height + SPAWN_OFFSET) * NEW_POSITION_Y -
        (NEW_POSITION_Y === 0 ? (vector.height - currentSelection.height) / 2 : 0);

      //vector.fillGeometry = currentSelection.fillGeometry
      //vector.strokeGeometry = currentSelection.strokeGeometry

      figma.viewport.scrollAndZoomIntoView([vector]);
    }
  };
}

const supportedTypes = {
  VECTOR: 1,
  RECTANGLE: 2,
  ELLIPSE: 3,
  STAR: 4,
  POLYGON: 5,
  TEXT: 6
};

const updateSelection = function () {
  if (figma.currentPage.selection.length) {
    currentSelection = figma.currentPage.selection[0] as SceneNode & DefaultShapeMixin;
  }

  figma.ui.postMessage({
    type: 'selection',
    amount: figma.currentPage.selection.length,
    supported: currentSelection && currentSelection.type in supportedTypes,
    shapeType: currentSelection?.type
  });
};

figma.on('selectionchange', updateSelection);
figma.currentPage.on('nodechange', function (event) {
  console.log(event);
});

updateSelection();
