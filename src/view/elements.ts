import {HTMLElementHash, InputHash} from '../types';

function getElement(selector: string): HTMLElement {
  const el = document.querySelector(selector);
  if (!(el instanceof HTMLElement)) {
    throw new Error(`Element ${selector} not found`);
  }
  return el;
}
function getInputElement(selector: string): HTMLInputElement {
  const el = getElement(selector);
  if (!(el instanceof HTMLInputElement)) {
    throw new Error(`Element ${selector} is not HTMLInputElement`);
  }
  return el;
}

export function collectUiElements(): HTMLElementHash {
  return {
    objectNotSelected: getElement('.object-not-selected'),
    annotation: getElement('.annotation'),
    objectSelected: getElement('.object-selected'),
    isInstant: getElement('.is_instant'),
    applyButton: getElement('.apply-button'),
    previewEl: getElement('.preview-3d'),
    projection: getElement('.is_3D'),
    canvas: getElement('#canvas')
  };
}

export function collectInputs(): InputHash {
  return {
    X: getInputElement('#X'),
    Y: getInputElement('#Y'),
    Z: getInputElement('#Z'),
    scale: getInputElement('#scale')
  };
}
