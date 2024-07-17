import {HTMLElementHash, InputHash, PointArray, Transformation} from '../types';
import {collectInputs, collectUiElements} from '../view/elements';
import {redraw3D} from '../view/preview';
import {INITIAL_VALUES, PROJECTION, UPDATE_MODE} from '../constants/consts';

export type uiCTX = {
  canvas: HTMLCanvasElement;
  ui: HTMLElementHash;
  inputElements: InputHash;
  ctx: CanvasRenderingContext2D;
  canvasSize: PointArray;
  resetInputValues: () => void;
  inputValues: Transformation;
  hideMessage: () => void;
  applyTransformation: () => void;
  showMessage: (text: string) => void;
  updateInputValue: (key: keyof Transformation, val: number) => void;
  loaded: Promise<boolean>;
};

let context: uiCTX;
const inputValues: Transformation = {...INITIAL_VALUES};

const loaded = new Promise<boolean>(function (resolve) {
  window.addEventListener('load', () => {
    resolve(true);
  });
});

export function initDOM(): Promise<boolean> {
  loaded.then(() => {
    const uiElements = collectUiElements();
    const canvas = uiElements.canvas as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    context = {
      canvas: canvas,
      ui: uiElements,
      inputElements: collectInputs(),
      ctx: ctx,
      canvasSize: [64, 64],
      inputValues: inputValues,
      applyTransformation: (instant?: boolean) => {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'apply-transformation',
              data: inputValues,
              instant: instant || false
            }
          },
          '*'
        );
      },
      updateInputValue: function (key: keyof Transformation, val: number) {
        if (isNaN(val)) {
          val = 0;
        }

        inputValues[key] = val;

        if (key in context.inputElements) {
          context.inputElements[key].value = val.toString();
        } else {
          if (key === 'projection') {
            (uiElements.projection as HTMLInputElement).checked = val === PROJECTION.ORTHOGRAPHIC;
          } else if (key === 'instant') {
            (uiElements.isInstant as HTMLInputElement).checked = val === UPDATE_MODE.INSTANT;
          }
        }
        redraw3D();

        if (inputValues.instant === UPDATE_MODE.INSTANT) {
          context.applyTransformation();
        }
      },
      resetInputValues: function (values: Transformation = {...INITIAL_VALUES}): void {
        // fast update instant, so copies would not be created
        inputValues.instant = values.instant;
        for (const key in values) {
          context.updateInputValue(key, values[key]);
        }
        redraw3D();
      },
      hideMessage: function () {
        context.ui.objectNotSelected.style.display = 'none';
        context.ui.objectSelected.style.display = 'block';
      },
      showMessage: function (text: string) {
        context.ui.objectNotSelected.style.display = 'block';
        context.ui.objectSelected.style.display = 'none';
        context.ui.annotation.innerText = text;
      },
      loaded: loaded
    };
  });
  return loaded;
}

export function getContext(): uiCTX {
  return context;
}
