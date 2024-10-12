import { hasTouch } from './utils.min.js';

export const setSwiper = function setSwiper(options) {
  const element = options.element;

  if (!element) return false;

  if (hasTouch()) {
    element.addEventListener(
      'touchstart',
      (event) => {
        element.dataset.startx = event.changedTouches[0].screenX;
        element.dataset.starty = event.changedTouches[0].screenY;
      },
      { passive: true },
    );
    element.addEventListener(
      'touchend',
      (event) => {
        element.dataset.endx = event.changedTouches[0].screenX;
        element.dataset.endy = event.changedTouches[0].screenY;

        const status = _handleSwipe(element);

        _callbacks(status, options, event);
      },
      { passive: true },
    );
  } else {
    element.addEventListener(
      'dragstart',
      (event) => {
        event.dataTransfer.setDragImage(element, -99999, -99999); //hide ghost image
        element.dataset.startx = event.clientX;
        element.dataset.starty = event.clientY;
      },
      { passive: true },
    );
    element.addEventListener(
      'dragover', //dobbiamo usare anche il dragover per un bug decennale di FF ..su dragend le coordinate sono sempre 0!
      (event) => {
        element.dataset.endx = event.clientX;
        element.dataset.endy = event.clientY;
      },
      { passive: true },
    );
    element.addEventListener(
      'dragend',
      (event) => {
        const status = _handleSwipe(element);

        _callbacks(status, options, event);
      },
      { passive: true },
    );
  }

  /*******************************************************************************/

  const _handleSwipe = function _handleSwipe(element) {
    const pageWidth = window.innerWidth || document.body.clientWidth;
    const treshold = Math.max(1, Math.floor(0.01 * pageWidth));
    const touchstartX = Number.parseInt(element.dataset.startx, 10);
    const touchendX = Number.parseInt(element.dataset.endx, 10);
    const touchstartY = Number.parseInt(element.dataset.starty, 10);
    const touchendY = Number.parseInt(element.dataset.endy, 10);
    const x = touchendX - touchstartX;
    const y = touchendY - touchstartY;
    const xy = Math.abs(x / y);
    const yx = Math.abs(y / x);

    const limit = Math.tan(((45 * 1.5) / 180) * Math.PI);

    const status = {
      swipeLeft: false,
      swipeRight: false,
      swipeUp: false,
      swipeDown: false,
      tap: false,
    };

    if (Math.abs(x) > treshold || Math.abs(y) > treshold) {
      if (yx <= limit) {
        if (x < 0) {
          status.swipeLeft = true;
        } else {
          status.swipeRight = true;
        }
      }
      if (xy <= limit) {
        if (y < 0) {
          status.swipeUp = true;
        } else {
          status.swipeDown = true;
        }
      }
    } else {
      status.tap = true;
    }

    return status;
  };

  /*******************************************************************************/

  const _callbacks = function _callbacks(status, options, event) {
    if (status.swipeLeft && options.onSwipeLeft) options.onSwipeLeft(event);
    if (status.swipeRight && options.onSwipeRight) options.onSwipeRight(event);
    if (status.swipeUp && options.onSwipeUp) options.onSwipeUp(event);
    if (status.swipeDown && options.onSwipeDown) options.onSwipeDown(event);
    if (status.tap && options.onTap) options.onTap(event);
  };
};
