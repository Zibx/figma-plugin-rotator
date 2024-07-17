import {POSITIONS} from './constants/position';
import {CacheItem, Transformation} from './types';
import {debounce} from './util/debounce';
import {transformPath} from './util/vectorPathsTransform';
import {SUPPORTED_TYPES} from './constants/consts';

const SPAWN_OFFSET = 16;

const SPAWN_AT = 'RIGHT';
const NEW_POSITION_X = POSITIONS[SPAWN_AT][0];
const NEW_POSITION_Y = POSITIONS[SPAWN_AT][1];

let currentSelection: SceneNode & DefaultShapeMixin;

const selectionMap = new WeakMap<BaseNode, CacheItem>();

if (figma.editorType === 'figma') {
  // Render plugin HTML
  figma.showUI(__html__, {themeColors: true});
  figma.ui.resize(300, 220);

  // Messages processing
  const messageHandler = async (msg: {data: Transformation; type: string; instant: boolean}) => {
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
        // vector.strokeCap = currentSelection.strokeCap;
        vector.strokeJoin = currentSelection.strokeJoin;
        vector.strokeMiterLimit = currentSelection.strokeMiterLimit;
        vector.strokeWeight = currentSelection.strokeWeight;
        vector.dashPattern = currentSelection.dashPattern;

        let selectionPaths: VectorPaths;

        // it may be a good idea to tune SUPPORTED_TYPES in a way that
        // value would specify the approach of getting path data

        if (NodeType === 'VECTOR') {
          selectionPaths = (currentSelection as VectorNode).vectorPaths;
          await vector.setVectorNetworkAsync(currentSelection.vectorNetwork);
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

        cached = {
          vector,
          transformation: msg.data,
          paths: selectionPaths,
          vectorNetwork: vector.vectorNetwork
        };
        selectionMap.set(currentSelection, cached);
      }

      cached = selectionMap.get(currentSelection) as CacheItem;

      vector = cached.vector;
      cached.transformation = msg.data;

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

      vector.vectorPaths = transformPath(cached.paths, msg.data, [
        currentSelection.width,
        currentSelection.height
      ]);

      vector.x = currentSelection.x + (currentSelection.width + SPAWN_OFFSET) * NEW_POSITION_X;
      vector.y =
        currentSelection.y +
        (currentSelection.height + SPAWN_OFFSET) * NEW_POSITION_Y -
        (NEW_POSITION_Y === 0 ? (vector.height - currentSelection.height) / 2 : 0);

      figma.viewport.scrollAndZoomIntoView([vector]);
    }
  };

  // wrap in debounce to have 30 FPS at max
  figma.ui.onmessage = debounce(messageHandler, 30, false);
}

const updateSelection = function () {
  if (figma.currentPage.selection.length) {
    currentSelection = figma.currentPage.selection[0] as SceneNode & DefaultShapeMixin;
  }

  figma.ui.postMessage({
    type: 'selection',
    amount: figma.currentPage.selection.length,
    supported: currentSelection && currentSelection.type in SUPPORTED_TYPES,
    shapeType: currentSelection?.type
  });
};

figma.on('selectionchange', updateSelection);

// TODO watch changes of the original object
/*figma.currentPage.on('nodechange', function (event) {
  console.log(event);
});*/

updateSelection();
