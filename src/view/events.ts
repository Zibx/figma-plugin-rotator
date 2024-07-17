import {getDomCtx} from './dom';
import {PROJECTION, Transformation} from '../types';
import {emptyFn} from '../util';

import {previewMouseDown, previewMouseMove, redraw3D} from './preview';

let afterInputUpdate: () => void = emptyFn;

export const inputUpdated: () => void = () => {
  afterInputUpdate();
};

export const listenEvents = function (): void {
  const {
    // get elements
    ui,
    canvas,
    canvasSize,
    inputValues,
    inputElements,
    updateInputValue
  } = getDomCtx();

  const resize = function () {
    const rect = ui.previewEl.getBoundingClientRect();
    canvasSize[0] = canvas.width = rect.width;
    canvasSize[1] = canvas.height = rect.height;
    requestAnimationFrame(redraw3D);
  };
  window.addEventListener('resize', () => requestAnimationFrame(resize));

  const applyTransformation = (instant?: boolean) => {
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
  };

  ui.applyButton.addEventListener('click', () => applyTransformation());

  // instant feature
  let instant = false;
  ui.isInstant.addEventListener('change', () => {
    instant = (ui.isInstant as HTMLInputElement).checked;
    ui.applyButton.classList[instant ? 'add' : 'remove']('button--hidden');
    if (instant) {
      applyTransformation(true);
      afterInputUpdate = () => {
        applyTransformation(true);
        return void 0;
      };
    } else {
      afterInputUpdate = emptyFn;
    }
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
