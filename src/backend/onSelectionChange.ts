import {MESSAGE_TYPE, SUPPORTED_TYPES} from '../constants/consts';
import {getCachedTransformation} from './getCachedNode';
import {SelectionMessage} from '../types';

export function listenSelectionChange(
  callback: (selection: SceneNode & DefaultShapeMixin) => void
): void {
  let currentSelection: SceneNode & DefaultShapeMixin;
  const updateSelection = function () {
    if (figma.currentPage.selection.length) {
      currentSelection = figma.currentPage.selection[0] as SceneNode & DefaultShapeMixin;
    }

    const message: SelectionMessage = {
      type: MESSAGE_TYPE.SELECTION,
      amount: figma.currentPage.selection.length,
      supported: currentSelection && currentSelection.type in SUPPORTED_TYPES,
      shapeType: currentSelection?.type,
      transformation: getCachedTransformation(currentSelection)
    };

    figma.ui.postMessage(message);
    callback(currentSelection);
  };

  figma.on('selectionchange', updateSelection);
  updateSelection();

  // TODO watch changes of the original object
  /*figma.currentPage.on('nodechange', function (event) {
    console.log(event);
  });*/
}
