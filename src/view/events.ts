import {getContext} from '../controller/context';
import {Transformation} from '../types';

import {previewMouseDown, previewMouseMove, redraw3D} from './preview';
import {PROJECTION, UPDATE_MODE} from '../constants/consts';

export const listenEvents = function (): void {
  const {
    // get elements
    ui,
    canvas,
    canvasSize,
    inputValues,
    inputElements,
    updateInputValue,
    applyTransformation
  } = getContext();

  const resize = function () {
    const rect = ui.previewEl.getBoundingClientRect();
    canvasSize[0] = canvas.width = rect.width;
    canvasSize[1] = canvas.height = rect.height;
    requestAnimationFrame(redraw3D);
  };
  window.addEventListener('resize', () => requestAnimationFrame(resize));

  ui.applyButton.addEventListener('click', () => applyTransformation());

  // instant feature
  ui.isInstant.addEventListener('change', () => {
    const instant = (ui.isInstant as HTMLInputElement).checked;
    updateInputValue('instant', instant ? UPDATE_MODE.INSTANT : UPDATE_MODE.MANUAL);

    ui.applyButton.classList[instant ? 'add' : 'remove']('button--hidden');
  });

  for (const elID in inputValues) {
    if (elID in inputElements) {
      inputElements[elID].addEventListener('input', function () {
        updateInputValue(elID as keyof Transformation, parseFloat(inputElements[elID].value));
      });
    }
  }

  ui.projection.addEventListener('change', () => {
    const is3D = (ui.projection as HTMLInputElement).checked;
    updateInputValue('projection', is3D ? PROJECTION.ORTHOGRAPHIC : PROJECTION.ISOGRAPHIC);
  });

  (ui.projection as HTMLInputElement).checked = inputValues.projection === PROJECTION.ORTHOGRAPHIC;

  canvas.addEventListener('mousemove', previewMouseMove);
  canvas.addEventListener('mousedown', previewMouseDown);

  resize();
};
