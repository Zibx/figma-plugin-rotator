import {MESSAGE_TYPE, SUPPORTED_TYPES} from '../constants/consts';
import {getCachedTransformation, getOriginalDataID, onlyGetCachedNode} from './getCachedNode';
import {SelectionMessage, UpdateMessage} from '../types';
import {getVectorData} from './copyNode';

export function listenSelectionChange(
  callback: (selection: SceneNode & DefaultShapeMixin) => void
): void {
  let currentSelection: SceneNode & DefaultShapeMixin;
  let originalID = '';

  const updateSelection = async function (): Promise<void> {
    if (figma.currentPage.selection.length) {
      currentSelection = figma.currentPage.selection[0] as SceneNode & DefaultShapeMixin;
    }

    const message: SelectionMessage = {
      type: MESSAGE_TYPE.SELECTION,
      amount: figma.currentPage.selection.length,
      supported: currentSelection && currentSelection.type in SUPPORTED_TYPES,
      shapeType: currentSelection?.type,
      transformation: await getCachedTransformation(currentSelection)
    };

    originalID = getOriginalDataID(currentSelection);

    figma.ui.postMessage(message);
    callback(currentSelection);
    informIfPathChanged().then();
  };

  const informIfPathChanged = async function (): Promise<boolean> {
    const cache = await onlyGetCachedNode(currentSelection);
    if (!cache) {
      return false;
    }

    const node: BaseNode | null = await figma.getNodeByIdAsync(cache.originalID);

    if (!node) {
      return false;
    }

    const data = getVectorData(node as SceneNode & DefaultShapeMixin);
    if (JSON.stringify(data) === JSON.stringify(cache.paths)) {
      return false;
    }
    const message: UpdateMessage = {
      type: MESSAGE_TYPE.ORIGINAL_PATH_UPDATED,
      originalID: originalID
    };
    figma.ui.postMessage(message);
    return true;
  };

  figma.on('selectionchange', updateSelection);
  updateSelection().then(() => void 0);

  // TODO watch changes of the original object
  figma.currentPage.on('nodechange', function (event: NodeChangeEvent) {
    event.nodeChanges.forEach((element: NodeChange): void => {
      if (element.id === originalID && element.type === 'PROPERTY_CHANGE') {
        informIfPathChanged().then();
      }
    });
  });
}
