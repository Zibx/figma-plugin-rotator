import {Transformation} from '../types';
import {getCachedNode} from './getCachedNode';
import {updateVector} from './updateVector';
import {debounce} from '../util/debounce';

export function handleUiMessages(getSelection: () => SceneNode & DefaultShapeMixin): void {
  // Messages processing
  const messageHandler = async (msg: {data: Transformation; type: string; instant: boolean}) => {
    const selection = getSelection();
    if (msg.type === 'apply-transformation') {
      // get from cache or create a copy
      const cached = await getCachedNode(selection, msg.data);
      if (!cached) {
        return;
      }

      const vector = cached.vector;
      cached.transformation = msg.data;
      cached.position.x = selection.x;
      cached.position.y = selection.y;
      cached.size.x = selection.width;
      cached.size.y = selection.height;

      updateVector(cached);

      figma.viewport.scrollAndZoomIntoView([vector]);
    }
  };

  // wrap in debounce to have 30 FPS at max
  figma.ui.onmessage = debounce(messageHandler, 30, false);
}
