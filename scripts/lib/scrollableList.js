import {
  debounce,
  hasTouch,
  nextFrame,
  setIntersectionObserverItems,
} from './utils.min.js';

/*-----------------------------------------------------------------------------------------------*/

export function setScroller(scrollingContainer) {
  const slides = scrollingContainer.querySelectorAll('.slide');

  setIntersectionObserverItems({
    elements: slides,
    callbackIn: (entry) => {
      entry.target.classList.add('is-visible');
      const evt = new CustomEvent('show', {
        detail: entry.target,
        bubbles: true,
      });
      entry.target.dispatchEvent(evt);
    },
    callbackOut: (entry) => {
      entry.target.classList.remove('is-visible');
      const evt = new CustomEvent('hide', {
        detail: entry.target,
        bubbles: true,
      });
      entry.target.dispatchEvent(evt);
    },
    dontUnobserve: true,
    rootMargin: '0px',
    threshold: 0.5,
  });

  let scrollingTimer;

  const btnPrev =
    document.getElementById('btnPrev') ||
    scrollingContainer.querySelector('.btn-prev');
  const btnNext =
    document.getElementById('btnNext') ||
    scrollingContainer.querySelector('.btn-prev');
  const debouncedCheckScroller = debounce(
    () => checkScroller(scrollingContainer, btnPrev, btnNext),
    50,
  );

  const resizeObserver = new ResizeObserver((entries) => {
    debouncedCheckScroller();
  });

  resizeObserver.observe(scrollingContainer);

  scrollingContainer.addEventListener(
    'scroll',
    () => {
      scrollingContainer.classList.add('scrolling');

      clearTimeout(scrollingTimer);
      scrollingTimer = setTimeout(() => {
        scrollingContainer.classList.remove('scrolling');
        const evt = new CustomEvent('scrollStop', {
          detail: scrollingContainer,
        });
        scrollingContainer.dispatchEvent(evt);
      }, 100);

      debouncedCheckScroller();
    },
    {
      passive: true,
    },
  );

  if (btnPrev) {
    btnPrev.addEventListener('click', (e) => {
      if (scrollingContainer.classList.contains('scrolling')) return false;

      e.stopPropagation();

      const firstVisibleSlide =
        scrollingContainer.querySelector('.slide.is-visible');
      const firstPreviousHiddenSlide = firstVisibleSlide
        ? firstVisibleSlide.previousElementSibling
        : null;

      const slideToGo = firstPreviousHiddenSlide;

      if (slideToGo) {
        slideToGo.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });
      } else {
        scrollingContainer.scrollLeft = 0;
        btnPrev.setAttribute('disabled', true);
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      if (scrollingContainer.classList.contains('scrolling')) return false;

      e.stopPropagation();

      const visibleSlides =
        scrollingContainer.querySelectorAll('.slide.is-visible');
      const lastVisibleSlide = visibleSlides
        ? visibleSlides[visibleSlides.length - 1]
        : null;
      const firstNextHiddenSlide = lastVisibleSlide
        ? lastVisibleSlide.nextElementSibling
        : null;
      const slideToGo = firstNextHiddenSlide;

      if (
        slideToGo ||
        Array.prototype.indexOf.call(slides, slideToGo) > slides.length
      ) {
        slideToGo.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'end',
        });
      } else {
        scrollingContainer.scrollLeft = scrollingContainer.scrollWidth;
        btnNext.setAttribute('disabled', true);
      }
    });
  }

  setDesktopScroller(scrollingContainer);
}

/*---------------------------------------------------------------------------------------*/

const checkScroller = function checkScroller(
  scrollingContainer,
  btnP,
  btnN,
  checkCallback,
  changeCallback,
) {
  const wasScrolledLeft =
    scrollingContainer.classList.contains('scrolled-left');
  const wasScrolledRight =
    scrollingContainer.classList.contains('scrolled-right');
  const btnPrev = btnP || scrollingContainer.querySelector('.btn-prev');
  const btnNext = btnN || scrollingContainer.querySelector('.btn-next');

  nextFrame(() => {
    scrollingContainer.classList.toggle(
      'scrolled-left',
      scrollingContainer.scrollLeft > 5,
    );
    scrollingContainer.classList.toggle(
      'scrolled-right',
      Math.ceil(scrollingContainer.scrollLeft) <
        scrollingContainer.scrollWidth - scrollingContainer.offsetWidth - 1,
    );

    const isScrolledLeft =
      scrollingContainer.classList.contains('scrolled-left');
    const isScrolledRight =
      scrollingContainer.classList.contains('scrolled-right');

    if (
      changeCallback &&
      (isScrolledLeft !== wasScrolledLeft ||
        isScrolledRight !== wasScrolledRight)
    )
      changeCallback(isScrolledLeft, isScrolledRight, scrollingContainer);

    if (btnPrev)
      if (scrollingContainer.classList.contains('scrolled-left'))
        btnPrev.removeAttribute('disabled');
      else btnPrev.setAttribute('disabled', true);

    if (btnNext)
      if (scrollingContainer.classList.contains('scrolled-right'))
        btnNext.removeAttribute('disabled');
      else btnNext.setAttribute('disabled', true);

    if (checkCallback)
      checkCallback(isScrolledLeft, isScrolledRight, scrollingContainer);
  });
};

/*-----------------------------------------------------------------------------------------------*/

const setDesktopScroller = function setDesktopScroller(scrollingContainer) {
  if (hasTouch()) return false;

  const slider = scrollingContainer;
  const SCROLL_SPEED = 4;

  let isDown = false;
  let startX;
  let scrollLeft;
  let startPos = [0, 0];
  let elapsedTime;
  let startTime = new Date().getTime();
  let wheelingTimer;
  let edging = 0;

  slider.addEventListener(
    'wheel',
    (e) => {
      let element = e.target;

      if (
        element.classList.contains('scrollable') ||
        element.closest('.scrollable')
      ) {
        element = element.classList.contains('scrollable')
          ? element
          : element.closest('.scrollable');

        if (element.scrollHeight > element.clientHeight) {
          if (
            element.scrollTop >=
              element.scrollHeight - element.offsetHeight - 1 ||
            element.scrollTop === 0
          ) {
            edging += 1;
            if (edging > 5) {
              edging = 0;
            } else {
              return true;
            }
          } else {
            edging = 0;
            return true;
          }
        }
      }

      edging = 0;
      nextFrame(() => {
        slider.scrollLeft += e.deltaX ? e.deltaX : e.deltaY;
        scrollingContainer.classList.add('wheeling');
        clearTimeout(wheelingTimer);
        wheelingTimer = setTimeout(
          () => scrollingContainer.classList.remove('wheeling'),
          200,
        );
      });
    },
    {
      passive: true,
    },
  );

  slider.querySelectorAll('a').forEach((element) => {
    element.addEventListener(
      'mousedown',
      (e) => {
        e.preventDefault();
      },
      { passive: false },
    );
  });

  slider.addEventListener(
    'mousedown',
    (e) => {
      isDown = true;
      slider.classList.add('dragging');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
      startPos = [e.pageX, e.pageY, slider.scrollLeft];
      startTime = new Date().getTime();
    },
    { passive: true },
  );
  slider.addEventListener(
    'mouseup',
    (e) => {
      isDown = false;
      elapsedTime = new Date().getTime();
      slider.classList.remove('dragging');

      if (
        elapsedTime - startTime < 500 &&
        e.pageX === startPos[0] &&
        e.pageY === startPos[1] &&
        slider.scrollLeft === startPos[2]
      ) {
        return true;
        // biome-ignore lint/nursery/noUselessElse: <explanation>
      } else {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    { passive: false },
  );

  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.classList.remove('dragging');
  });
  slider.addEventListener(
    'mousemove',
    (e) => {
      if (!isDown) return;
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * SCROLL_SPEED;
      nextFrame(() => {
        slider.scrollLeft = scrollLeft - walk;
      });
    },
    { passive: false },
  );
  slider.addEventListener(
    'dragstart',
    (e) => {
      const targetItem = e.target.classList.contains('drag-item')
        ? e.target
        : e.target.closest('.drag-item');

      if (!targetItem) e.dataTransfer.setDragImage(slider, -99999, -99999); //hide ghost image
    },
    { passive: true },
  );

  slider.classList.add('swipeable');
};

/*-----------------------------------------------------------------------------------------------*/
