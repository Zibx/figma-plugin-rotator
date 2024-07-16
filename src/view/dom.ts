import {HTMLElementHash, InputHash, PointArray, Transformation} from '../types';
import {collectInputs, collectUiElements} from './elements';

export type uiCTX = {
  canvas: HTMLCanvasElement;
  ui: HTMLElementHash;
  inputElements: InputHash;
  ctx: CanvasRenderingContext2D;
  canvasSize: PointArray;
  resetInputValues: () => void;
  inputValues: Transformation;
  hideMessage: () => void;
  showMessage: (text: string) => void;
  loaded: Promise<boolean>;
};

let uiContext: uiCTX;
let inputElementsCache: InputHash;
let inputValues: Transformation = {X: 0, Y: 0, Z: 0, scale: 1};

const resetInputValues = function(): void {
  inputValues = {X: 0, Y: 0, Z: 0, scale: 1};
  for (const key in inputValues) {
    inputElementsCache[key].value = inputValues[key as keyof Transformation].toString();
  }
};

const loaded = new Promise<boolean>(function (resolve) {
  window.addEventListener('load', () => {
    resolve(true);
  });
});

export function initDOM(): Promise<boolean> {
  loaded.then((_) => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    // Collect all DOM input elements
    uiContext = {
      canvas: canvas,
      ui: collectUiElements(),
      inputElements: collectInputs(),
      ctx: ctx,
      canvasSize: [64, 64],
      inputValues: inputValues,
      resetInputValues: resetInputValues,
      hideMessage: function () {
        uiContext.ui.objectNotSelected.style.display = 'none';
        uiContext.ui.objectSelected.style.display = 'block';
      },
      showMessage: function (text: string) {
        uiContext.ui.objectNotSelected.style.display = 'block';
        uiContext.ui.objectSelected.style.display = 'none';
      },
      loaded: loaded
    };
  });
  return loaded;
}

export function getDomCtx(): uiCTX {
  return uiContext;
}
