import {Transformation} from '../types';
import {getCachedNode, getCachedTransformation, updateCahcedNode} from './getCachedNode';
import {updateVector} from './updateVector';
import {debounce} from '../util/debounce';
import {MESSAGE_TYPE} from '../constants/consts';

export function handleUiMessages(getSelection: () => SceneNode & DefaultShapeMixin): void {
  // Messages processing
  const messageHandler = async (msg: {data: Transformation; type: string; instant: boolean}) => {
    const selection = getSelection();
    if (msg.type === MESSAGE_TYPE.APPLY_TRANSFORMATION) {
      // get from cache or create a copy
      const cached = await getCachedNode(selection, msg.data);
      if (!cached) {
        return;
      }

      const transformation = msg.data;
      const vector = cached.vector;
      cached.transformation = transformation;

      updateVector(cached);
      selection.setPluginData('rotator', JSON.stringify(transformation));
      // selection.setPluginData('rotator', JSON.stringify(cached));
      /*      vector.setPluginData(
        'rotator',
        JSON.stringify(Object.assign({}, transformation, {target: true}))
      );*/
      //figma.viewport.scrollAndZoomIntoView([vector]);
    } else if (msg.type === MESSAGE_TYPE.UPDATE_PATH_DATA) {
      const cached = await updateCahcedNode(selection as VectorNode);
      if (!cached) {
        return;
      }
      updateVector(cached);
      figma.viewport.scrollAndZoomIntoView([selection]);
    }
  };

  // wrap in debounce to have 30 FPS at max
  figma.ui.onmessage = debounce(messageHandler, 30, false);
}
