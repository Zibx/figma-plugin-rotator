import {listenSelectionChange} from './backend/onSelectionChange';
import {handleUiMessages} from './backend/uiMessages';

if (figma.editorType === 'figma') {
  // Render plugin HTML
  figma.showUI(__html__, {themeColors: true});
  figma.ui.resize(300, 220);

  let currentSelection: SceneNode & DefaultShapeMixin;
  listenSelectionChange((selection) => (currentSelection = selection));
  handleUiMessages(() => currentSelection);
}
