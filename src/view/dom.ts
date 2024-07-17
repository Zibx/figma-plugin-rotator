import {HTMLElementHash, InputHash, PointArray, PROJECTION, Transformation} from '../types';
import {collectInputs, collectUiElements} from './elements';
import {redraw3D} from './preview';
import {inputUpdated} from './events';

export const INITIAL_VALUES: Transformation = {
  X: 0,
  Y: 0,
  Z: 0,
  scale: 1,
  projection: PROJECTION.ORTHOGRAPHIC
};

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
  updateInputValue: (key: keyof Transformation, val: number) => void;
  loaded: Promise<boolean>;
};

let uiContext: uiCTX;
const inputValues: Transformation = {...INITIAL_VALUES};

const loaded = new Promise<boolean>(function (resolve) {
  window.addEventListener('load', () => {
    resolve(true);
  });
});

export function initDOM(): Promise<boolean> {
  loaded.then(() => {
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
      updateInputValue: function (key: keyof Transformation, val: number) {
        if (isNaN(val)) {
          val = 0;
        }
        inputValues[key] = val;
        if (key in uiContext.inputElements) {
          uiContext.inputElements[key].value = val.toString();
        }
        redraw3D();
        inputUpdated();
        //afterInputUpdate();
      },
      resetInputValues: function (): void {
        for (const key in INITIAL_VALUES) {
          uiContext.updateInputValue(
            key as keyof Transformation,
            INITIAL_VALUES[key as keyof Transformation]
          );

          if (key in uiContext.inputElements) {
            uiContext.inputElements[key].value =
              inputValues[key as keyof Transformation].toString();
          }
        }
      },
      hideMessage: function () {
        uiContext.ui.objectNotSelected.style.display = 'none';
        uiContext.ui.objectSelected.style.display = 'block';
      },
      showMessage: function (text: string) {
        uiContext.ui.objectNotSelected.style.display = 'block';
        uiContext.ui.objectSelected.style.display = 'none';
        uiContext.ui.annotation.innerText = text;
      },
      loaded: loaded
    };
  });
  return loaded;
}

export function getDomCtx(): uiCTX {
  return uiContext;
}
