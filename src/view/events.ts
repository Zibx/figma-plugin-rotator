import {getDomCtx} from './dom';
import {Transformation} from '../types';
import {emptyFn} from '../util';
import {redraw3D} from './preview';

export const listenEvents = function (): void {
  const {ui, canvas, canvasSize, inputValues, inputElements} = getDomCtx();

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

  let afterInputUpdate = emptyFn;

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
    const updateInputValue = function () {
      inputValues[elID as keyof Transformation] = parseFloat(inputElements[elID].value);
      redraw3D();
      afterInputUpdate();
    };
    inputElements[elID].addEventListener('input', updateInputValue);
  }

  resize();
};
