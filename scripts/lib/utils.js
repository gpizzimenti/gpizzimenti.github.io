/*---------------------------------------------------------------------------------------*/

export function hasTouch() {
  const _has =
    window.matchMedia?.('(any-pointer:coarse)').matches ||
    'ontouchstart' in window ||
    (window.DocumentTouch && window.document instanceof DocumentTouch) ||
    window.navigator.maxTouchPoints ||
    window.navigator.msMaxTouchPoints;

  document.querySelector('html').classList.toggle('has-touch', !!_has);

  return _has;
}

/*---------------------------------------------------------------------------------------*/

export function isScrollable(element) {
  const overflowY = window.getComputedStyle(element)['overflow-y'];
  const overflowX = window.getComputedStyle(element)['overflow-x'];
  const _hasV =
    (overflowY === 'scroll' || overflowY === 'auto') &&
    element.scrollHeight > element.offsetHeight;
  const _hasH =
    (overflowX === 'scroll' || overflowX === 'auto') &&
    element.scrollWidth > element.offsetWidth;

  return { vertical: _hasV, horizontal: _hasH, both: _hasV && _hasH };
}

/*---------------------------------------------------------------------------------------*/

export function html(container, html, append) {
  if (!container) return false;

  if (!append || !html) {
    container.textContent = '';
  }

  const tmpl = document.createElement('template');
  const fragment = document.createDocumentFragment();

  tmpl.innerHTML = html;
  fragment.appendChild(tmpl.content);
  container.appendChild(fragment);
}

/*---------------------------------------------------------------------------------------*/

export const nextFrame = function nextFrame(func) {
  //https://dev.to/nikitadmitr/the-other-side-of-using-requestanimationframe-4jk6
  requestAnimationFrame(() => {
    requestAnimationFrame(func);
  });
};

/*---------------------------------------------------------------------------------------*/

export const softExec = function softExec(func, wait) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(func, {
      timeout: wait || 5000,
    });
  } else {
    nextFrame(func);
  }
};

/*---------------------------------------------------------------------------------------*/

export function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

/*---------------------------------------------------------------------------------------*/

export function englishOrdinalSuffix(number) {
  const english_ordinal_rules = new Intl.PluralRules('en', { type: 'ordinal' });
  const suffixes = {
    one: 'st',
    two: 'nd',
    few: 'rd',
    other: 'th',
  };
  const category = english_ordinal_rules.select(number);
  const suffix = suffixes[category];

  return suffix;
}

/*-----------------------------------------------------------------------------------------------*/

export function unescapeHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.documentElement.textContent;
}

/*-----------------------------------------------------------------------------------------------*/

export function setIntersectionObserverItems(options) {
  if (!options?.elements) return false;

  let intersectionObserver;
  let itemsObserved = options.elements.length ? options.elements.length : 1;

  const onIntersection = function _onIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (!options.dontUnobserve) {
          intersectionObserver.unobserve(entry.target);
          itemsObserved -= 1;

          if (itemsObserved === 0) {
            intersectionObserver.disconnect();
            intersectionObserver = null;
            if (options.callbackCompleted) options.callbackCompleted();
          }
        }

        //softExec(() => {
        options.callbackIn(entry);
        //});
      } else if (options.callbackOut) {
        options.callbackOut(entry);
      }
    });
  };

  let observerOptions;

  if (options.root || options.rootMargin || options.threshold) {
    observerOptions = {};

    if (options.root) {
      observerOptions.root = options.root;
    }
    if (options.rootMargin) {
      observerOptions.rootMargin = options.rootMargin;
    }
    if (options.threshold) {
      observerOptions.threshold = options.threshold;
    }
  }

  intersectionObserver = new IntersectionObserver(
    onIntersection,
    observerOptions,
  );

  options.elements.forEach((entry) => {
    intersectionObserver.observe(entry);
  });
}

/*-----------------------------------------------------------------------------------------------*/

export async function fetchResource(url, type, id) {
  return new Promise((resolve, reject) => {
    let element;
    let elementType;
    let props;
    let resolved;
    let resourceId;

    const parent =
      type === 'js' || type === 'css' ? document.head : document.body;

    if (id) {
      resourceId = `GP-resource-${id}-${type}`;
      element = parent.querySelector(`#${resourceId}`);
      if (element) {
        if (!element.classList.contains('loading')) resolve(element);
        resolved = true;
      }
    }

    if (!resolved) {
      if (type === 'js') {
        elementType = 'script';
        props = {
          fetchpriority: 'high',
          type: 'text/javascript',
          src: url,
          async: true,
        };
      } else if (type === 'css') {
        elementType = 'link';
        props = {
          fetchpriority: 'high',
          type: 'text/css',
          rel: 'stylesheet preload',
          href: url,
          as: 'style',
        };
      } else if (type === 'template') {
        elementType = 'template';
        props = {};
      }

      if (resourceId) props.id = resourceId;

      element = document.createElement(elementType);
      element.classList.add('loading');

      if (type === 'js' || type === 'css') {
        element.onload = element.onreadystatechange = () => {
          element.classList.remove('loading');
          element.onreadystatechange = element.onload = null;
          resolve(element);
        };
        element.onerror = () => {
          element.classList.remove('loading');
          element.onerror = null;
          reject(element);
        };
      } else {
        fetch(url)
          .then((response) => {
            return response.text();
          })
          .then((html) => {
            element.innerHTML = html;
            resolve(element);
          })
          .catch(() => {
            reject(element);
          })
          .finally(() => {
            element.classList.remove('loading');
          });
      }

      for (const property in props) {
        element[property] = props[property];
      }

      parent.appendChild(element);
    }
  });
}

/*-----------------------------------------------------------------------------------------*/
