import {HTMLElementHash, InputHash} from '../types';

export function collectUiElements(): HTMLElementHash {
  return {
    objectNotSelected: document.querySelector('.object-not-selected') as HTMLElement,
    annotation: document.querySelector('.annotation') as HTMLElement,
    objectSelected: document.querySelector('.object-selected') as HTMLElement,
    isInstant: document.querySelector('.is_instant') as HTMLElement,
    applyButton: document.querySelector('.apply-button') as HTMLElement,
    previewEl: document.body.querySelector('.preview-3d') as HTMLElement
  };
}

export function collectInputs(): InputHash {
  return {
    X: document.getElementById('X') as HTMLInputElement,
    Y: document.getElementById('Y') as HTMLInputElement,
    Z: document.getElementById('Z') as HTMLInputElement,
    scale: document.getElementById('scale') as HTMLInputElement
  };
}
