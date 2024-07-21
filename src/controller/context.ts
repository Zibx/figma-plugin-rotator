import {HTMLElementHash, InputHash, Transformation} from '../types';
import {collectInputs, collectUiElements} from '../view/elements';
import {redraw3D} from '../view/preview';
import {INITIAL_VALUES, MESSAGE_TYPE, PROJECTION, UPDATE_MODE} from '../constants/consts';
import {Point} from '../util/Point';

export type uiCTX = {
  canvas: HTMLCanvasElement;
  ui: HTMLElementHash;
  inputElements: InputHash;
  ctx: CanvasRenderingContext2D;
  canvasSize: Point;
  resetInputValues: (transformation: Transformation | undefined) => void;
  inputValues: Transformation;
  hideMessage: () => void;
  showCloneDialog: () => void;
  hideCloneDialog: () => void;
  updatePathData: () => void;
  showObjectModificationDialog: () => void;
  hideObjectModificationDialog: () => void;
  showUpdatePathButton: () => void;
  hideUpdatePathButton: () => void;
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
      canvasSize: new Point(64, 64),
      inputValues: inputValues,
      applyTransformation: (instant?: boolean) => {
        parent.postMessage(
          {
            pluginMessage: {
              type: MESSAGE_TYPE.APPLY_TRANSFORMATION,
              data: inputValues,
              instant: instant || false
            }
          },
          '*'
        );
      },
      updatePathData: () => {
        parent.postMessage(
          {
            pluginMessage: {
              type: MESSAGE_TYPE.UPDATE_PATH_DATA
            }
          },
          '*'
        );
        context.hideUpdatePathButton();
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

            // hide Apply button if in instant mode
            if (val === UPDATE_MODE.INSTANT) {
              uiElements.applyButton.classList.add('button--hidden');
            } else {
              uiElements.applyButton.classList.remove('button--hidden');
            }
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
      showObjectModificationDialog: function () {
        context.ui.objectSelected.style.display = 'block';
      },
      hideObjectModificationDialog: function () {
        context.ui.objectSelected.style.display = 'none';
      },
      showCloneDialog: function () {
        context.ui.objectClonePane.style.display = 'block';
      },
      hideCloneDialog: function () {
        context.ui.objectClonePane.style.display = 'none';
      },
      hideMessage: function () {
        context.ui.objectNotSelected.style.display = 'none';
      },
      showMessage: function (text: string) {
        context.ui.objectNotSelected.style.display = 'block';
        context.ui.annotation.innerText = text;
      },
      showUpdatePathButton: function (): void {
        context.ui.updatePathButton.style.display = 'block';
      },
      hideUpdatePathButton: function (): void {
        context.ui.updatePathButton.style.display = 'none';
      },
      loaded: loaded
    };
  });
  return loaded;
}

export function getContext(): uiCTX {
  return context;
}
