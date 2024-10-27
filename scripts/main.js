import { HexToHSL, invertColor } from './lib/colors.min.js';
import { setScroller } from './lib/scrollableList.min.js';
import {
  debounce,
  englishOrdinalSuffix,
  fetchResource,
  hasTouch,
  html,
  isScrollable,
  nextFrame,
  setIntersectionObserverItems,
  softExec,
} from './lib/utils.min.js';

/*-----------------------------------------------------------------------------------------------*/

const context = {
  domain: 'giuseppe.pizzimenti.dev',
  languages: ['it', 'en'],
};

context.labels = {
  it: {
    downloadStarted: 'Download avviato',
    error: 'Si è verificato un errore',
    errorLoading: 'Errore nel caricamento',
    loading: 'Caricamento in corso',
    messageSent: 'Messaggio inviato',
    offline: 'Connessione assente',
    offlineTryLater: 'Connessione assente, prova più tardi',
    online: 'Sei di nuovo online',
    sceglisezioni:
      'Scegli le sezioni da includere e trascinale per riordinarle',
    nrtrovati: (nr, index) =>
      nr === 0
        ? 'Nessun risultato'
        : nr === 1
          ? '<b>1</b> risultato'
          : `<b>${index}</b><sup>&#176;</sup> di <b>${nr}</b> risultati`,
    title: 'Giuseppe Pizzimenti - Software Developer',
  },
  en: {
    downloadStarted: 'Download started',
    error: 'An error occurred',
    errorLoading: 'Network error',
    loading: 'Loading',
    messageSent: 'Message sent',
    offline: 'Connection lost',
    offlineTryLater: 'Connection lost, try later',
    online: 'You are online again',
    sceglisezioni: 'Choose the sections to include and drag to reorder',
    nrtrovati: (nr, index) =>
      nr === 0
        ? 'No results'
        : nr === 1
          ? '<b>1</b> result'
          : `<b>${index}</b><sup>${englishOrdinalSuffix(
              index,
            )}</sup> of <b>${nr}</b> results`,
    title: 'Giuseppe Pizzimenti - Software Developer',
  },
};

context.dynaContent = {
  datalists: {
    it: {
      corsi: {
        name: 'corsi',
        ready: false,
      },
      eventi_partecipante: {
        name: 'eventi_partecipante',
        ready: false,
      },
      eventi_relatore: {
        name: 'eventi_relatore',
        ready: false,
      },
    },
    en: {
      corsi: {
        name: 'corsi',
        ready: false,
      },
      eventi_partecipante: {
        name: 'eventi_partecipante',
        ready: false,
      },
      eventi_relatore: {
        name: 'eventi_relatore',
        ready: false,
      },
    },
  },
  slides: {
    it: {
      chisono: {
        name: 'chisono',
        title: 'Chi sono',
        ready: false,
      },
      profili: {
        name: 'profili',
        title: 'Profili',
        ready: false,
      },
      esperienza: {
        name: 'esperienza',
        title: 'Esperienza',
        ready: false,
      },
      skills: {
        name: 'skills',
        title: 'Competenze tecniche',
        ready: false,
      },
      formazione: {
        name: 'formazione',
        title: 'Studi e Formazione',
        ready: false,
      },
      eventi: {
        name: 'eventi',
        title: 'Eventi',
        ready: false,
      },
      associazioni: {
        name: 'associazioni',
        title: 'Associazioni',
        ready: false,
      },
      pubblicazioni: {
        name: 'pubblicazioni',
        title: 'Pubblicazioni',
        ready: false,
      },
      progetti: {
        name: 'progetti',
        title: 'Progetti personali',
        ready: false,
      },
      cv: {
        name: 'cv',
        title: 'Curriculum vitae',
        ready: false,
      },
      contattami: {
        name: 'contattami',
        title: 'Contattami',
        ready: false,
      },
    },
    en: {
      chisono: {
        name: 'chisono',
        title: 'About me',
        ready: false,
      },
      profili: {
        name: 'profili',
        title: 'Profiles',
        ready: false,
      },
      esperienza: {
        name: 'esperienza',
        title: 'Experience',
        ready: false,
      },
      skills: {
        name: 'skills',
        title: 'Technical skills',
        ready: false,
      },
      formazione: {
        name: 'formazione',
        title: 'Education & Courses',
        ready: false,
      },
      eventi: {
        name: 'eventi',
        title: 'Events',
        ready: false,
      },
      associazioni: {
        name: 'associazioni',
        title: 'Associations',
        ready: false,
      },
      pubblicazioni: {
        name: 'pubblicazioni',
        title: 'Publications',
        ready: false,
      },
      progetti: {
        name: 'progetti',
        title: 'Personal projects',
        ready: false,
      },
      cv: {
        name: 'cv',
        title: 'Resume',
        ready: false,
      },
      contattami: {
        name: 'contattami',
        title: 'Contact me',
        ready: false,
      },
    },
  },
};

const config = {
  urls: {
    modules: {
      cv: './cv.min.js',
      contactme: './contactForm.min.js',
    },
    libs: {
      dayjs: './lib/dayjs/1.11.7/dayjs.min.js',
      markjs: './lib/markjs/9.0.0/mark.es6.min.js',
      jspdf: './scripts/lib/jsPDF/2.5.1/jspdf-2.5.1.umd.min.js' /*,
      jspdfhtml2canvas: './scripts/jsPDF/2.5.1/jspdf-html2canvas.min.js',
      html2canvas: './scripts/lib/html2canvas/1.4.1/html2canvas.min.js'*/,
      dompurify: './scripts/lib/domPurify/3.0.6/dompurify.min.js',
      draggablelistjs: './lib/draggableList.min.js',
      notificationsjs: './lib/notifications.min.js',
      swiperjs: './lib/swiper.min.js',
    },
    datalists: {
      corsi: [
        '../data/corsi/2024.min.json',
        '../data/corsi/2023.min.json',
        '../data/corsi/2022.min.json',
        '../data/corsi/2020.min.json',
        '../data/corsi/2018.min.json',
        '../data/corsi/2016.min.json',
        '../data/corsi/2013.min.json',
        '../data/corsi/2008.min.json',
        '../data/corsi/2005.min.json',
        '../data/corsi/2004.min.json',
        '../data/corsi/1998.min.json',
      ],
      eventi_partecipante: [
        '../data/eventi/partecipante.min.json',
        '../data/eventi/codemotion/codemotion_gmail1_1.min.json',
        '../data/eventi/codemotion/codemotion_gmail1_2.min.json',
        '../data/eventi/codemotion/codemotion_gmail1_3.min.json',
        '../data/eventi/eventbrite/eventbrite_gmail1.min.json',
        '../data/eventi/eventbrite/eventbrite_gmail2.min.json',
        '../data/eventi/google/giuseppe.pizzimenti.seed@gmail.com.min.json',
        //'../data/eventi/google/giuseppe.pizzimenti.seed@gmail.com.ics',
      ],
      eventi_relatore: ['../data/eventi/relatore.min.json'],
    },
    workers: { db: './scripts/data.worker.min.js' },
    schema: './schema.min.json',
    include: (lang, sezione) => `./includes/${lang}/${sezione}.inc.min.html`,
  },
};

/*-----------------------------------------------------------------------------------------------*/

const setup = function setup() {
  softExec(setUI);
  softExec(setState);

  softExec(setEvents);
  softExec(setDataWorker);
  softExec(() => setScroller(context.elementsCache.scrollingContainer));

  softExec(setMenu);
  softExec(setSearch);

  const startSection = location.hash ? location.hash.substring(1) : 'chisono';
  setTimeout(() => softExec(() => navigate(startSection)), 200);

  softExec(() => fetchResource(config.urls.schema, 'jsonld', 'schema'));
};

/*-----------------------------------------------------------------------------------------------*/

const setUI = function setUI() {
  context.elementsCache = {
    colorPicker: document.getElementById('color'),
    languageSwitcher: document.getElementById('language'),
    scrollingContainer: document.querySelector('main'),
    sectionsMenu: document.getElementById('sectionsMenu'),
  };

  const slides = context.elementsCache.scrollingContainer.querySelectorAll(
    'section[data-sezione]',
  );

  setIntersectionObserverItems({
    elements: slides,
    callbackIn: (entry) => {
      executeWhenNotScrolling(() => setSlide(entry.target));
    },
    rootMargin: '0px',
    threshold: 0.2,
  });

  document.body.classList.add('loaded');
};

/*-----------------------------------------------------------------------------------------------*/

const setSlide = function setSlide(sezione) {
  const lang = sezione.getAttribute('lang');
  const evtDetail = {
    name: sezione.dataset.sezione,
    lang: lang,
    error: null,
    slide: sezione,
  };
  const throwEvent = () => {
    const evt = new CustomEvent('slideRendered', { detail: evtDetail });
    context.elementsCache.scrollingContainer.dispatchEvent(evt);
  };

  return new Promise((resolve, reject) => {
    if (sezione.classList.contains('rendered')) {
      resolve();
    } else {
      const container = sezione.querySelector('article');
      sezione.classList.add('loading');
      html(
        container,
        `<p class="loadingText>${
          context.labels[context.state.lang].loading
        }</p>`,
      );
      fetch(config.urls.include(lang, sezione.dataset.sezione))
        .then((response) => response.text())
        .then((text) => {
          const callback = () =>
            renderSlide(container, text, lang).then(() => {
              sezione.classList.remove('loading');
              sezione.classList.add('rendered');
              throwEvent();
            });

          executeWhenNotScrolling(callback);
        })
        .catch((err) => {
          html(
            container,
            `<p class="errorText">${
              context.labels[context.state.lang].errorLoading
            }</p>`,
          );
          sezione.classList.add('error');
          console.warn('setSlide', err);
          evtDetail.error = err;
          throwEvent();
          reject(err);
        });
    }
  });
};

/*-----------------------------------------------------------------------------------------------*/

const renderSlide = async function renderSlide(container, content, lang) {
  html(container, content);

  container
    .querySelectorAll('details:not(.togglerSet)')
    .forEach((el) => setDetails(el));

  container.querySelectorAll('[data-dblist]').forEach((el) => {
    context.workers.db.postMessage({
      action: 'renderDataList',
      name: el.dataset.dblist,
      lang: lang,
      datasources: config.urls.datalists[el.dataset.dblist],
    });
  });

  if (container.querySelector('[data-datestart]')) return setDates(container);
};

/*-----------------------------------------------------------------------------------------------*/

const setState = function setState() {
  context.state = localStorage.getItem(context.domain)
    ? JSON.parse(localStorage.getItem(context.domain))
    : { lang: 'it' };

  if (context.state.lang) {
    setLang(context.state.lang);
    context.elementsCache.languageSwitcher.querySelector(
      `[value='${context.state.lang}']`,
    ).checked = true;
  }

  if (context.state.baseColor) {
    setBGColor(context.state.baseColor);
    context.elementsCache.colorPicker.value = context.state.baseColor;
  }
};

/*-----------------------------------------------------------------------------------------------*/

const setEvents = function setEvents() {
  context.elementsCache.colorPicker.addEventListener(
    'input',
    () => setBGColor(context.elementsCache.colorPicker.value),
    false,
  );

  context.elementsCache.languageSwitcher.addEventListener('click', (evt) =>
    evt.stopPropagation(),
  );

  context.elementsCache.languageSwitcher.addEventListener(
    'change',
    () =>
      setLang(
        context.elementsCache.languageSwitcher.querySelector(':checked').value,
      ),
    false,
  );

  context.elementsCache.scrollingContainer.addEventListener(
    'change',
    (evt) => {
      const el = evt.target;

      if (el?.classList.contains('chkMaximize'))
        toggleMaximizeSlide(el.closest('.slide'), el.checked);
    },
    false,
  );

  context.elementsCache.scrollingContainer
    .querySelectorAll('.slide')
    .forEach((slide) =>
      slide.addEventListener(
        'mouseenter',
        (evt) => {
          const expandedSlide =
            context.elementsCache.scrollingContainer.querySelector('.expanded');

          if (expandedSlide?.id !== slide.id)
            expandedSlide?.classList.remove('expanded');
        },
        false,
      ),
    );

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleMaximizeSlide(
        context.elementsCache.scrollingContainer.querySelector(
          '.slide.maximized',
        ),
        false,
      );
    }
  });

  context.elementsCache.scrollingContainer.addEventListener(
    'datalistRendered',
    (evt) => {
      logLoadedEvent('datalistRendered', evt.detail);
    },
  );

  context.elementsCache.scrollingContainer.addEventListener(
    'slideRendered',
    (evt) => {
      logLoadedEvent('slideRendered', evt.detail);

      if (evt.detail.name === 'cv') {
        setCV(evt.detail.slide);
      }
    },
  );

  context.elementsCache.scrollingContainer.addEventListener('submit', (evt) => {
    evt.preventDefault();

    const form = evt.target;

    switch (form?.dataset?.rel) {
      case 'cv':
        downloadCV();
        break;
      case 'contattami':
        sendMsg(form);
        break;
      default:
        break;
    }
  });

  window.addEventListener('hashchange', navigate);

  window.addEventListener('popstate', (stateEvt) => {
    const maximizedSlide =
      context.elementsCache.scrollingContainer.querySelector('.maximized');
    if (maximizedSlide) toggleMaximizeSlide(maximizedSlide, false);

    if (stateEvt.state?.scrollLeft) {
      document.title = context.labels[context.state.lang].title;
      context.elementsCache.scrollingContainer.scrollLeft =
        stateEvt.state.scrollLeft;
    } else navigate();
  });

  const canSwipe = hasTouch() && import(config.urls.libs.swiperjs);

  if (canSwipe)
    canSwipe.then((swiper) => {
      swiper.setSwiper({
        element: context.elementsCache.scrollingContainer,
        onSwipeRight: (event) => handleSwipe(event.target, 'R'),
        onSwipeLeft: (event) => handleSwipe(event.target, 'L'),
      });
    });

  window.addEventListener('offline', () => {
    notify(context.labels[context.state.lang].offline, 'warning');
  });

  window.addEventListener('online', () => {
    notify(context.labels[context.state.lang].online, 'info');
  });
};

/*-----------------------------------------------------------------------------------------------*/

const handleSwipe = function handleSwipe(element, dir) {
  const scrollable = element.classList.contains('scrollable')
    ? element
    : element.closest('.scrollable');

  if (scrollable && isScrollable(scrollable).vertical) {
    const activeSection = scrollable.closest('li[data-sezione]');
    const activeSectionId = Number.parseInt(activeSection.dataset.index);
    const sections = scrollable.querySelectorAll('li[data-sezione]');

    if (
      (activeSectionId === 1 && dir === 'R') ||
      (activeSectionId === sections.length && dir === 'L')
    )
      return true;

    setActiveSectionByIndex(activeSectionId + (dir === 'R' ? -1 : 1));
  } else return true;
};

/*-----------------------------------------------------------------------------------------------*/

const logLoadedEvent = function logLoadedEvent(evt, detail) {
  const type = `${evt.replace('Rendered', '')}s`;
  const throwEvent = () => {
    const evt = new CustomEvent('allDynaContentLoaded', {
      detail: detail.lang,
    });
    context.elementsCache.scrollingContainer.dispatchEvent(evt);
  };

  context.dynaContent[type][detail.lang][detail.name].ready = true;

  if (isAllDynaContentLoaded(detail.lang)) throwEvent();
};

/*-----------------------------------------------------------------------------------------------*/

const isAllDynaContentLoaded = function isAllDynaContentLoaded(lang) {
  const langToCheck = lang || context.state.lang;
  let allLoaded = true;

  Object.keys(context.dynaContent).forEach((type) => {
    if (allLoaded)
      allLoaded = !Object.values(context.dynaContent[type][langToCheck]).find(
        (section) => !section.ready,
      );
  });

  return allLoaded;
};

/*-----------------------------------------------------------------------------------------------*/

const loadAllDynaContent = function loadAllDynaContent(lang) {
  const langToCheck = lang || context.state.lang;

  return new Promise((resolve) => {
    if (isAllDynaContentLoaded(context.state.lang)) resolve();
    else {
      context.elementsCache.scrollingContainer.addEventListener(
        'allDynaContentLoaded',
        () => {
          resolve();
        },
      );

      const slidesToLoad = Object.values(
        context.dynaContent.slides[langToCheck],
      ).filter((slide) => !slide.ready);

      slidesToLoad.forEach((slide) => {
        const li = context.elementsCache.scrollingContainer.querySelector(
          `section[data-sezione='${slide.name}'][lang='${langToCheck}']`,
        );
        setSlide(li);
      });
    }
  });
};

/*-----------------------------------------------------------------------------------------------*/

const setDataWorker = function setDataWorker() {
  context.workers = context.workers || {};
  context.workers.db = new Worker(config.urls.workers.db, {
    type: 'module',
  });

  context.workers.db.onmessage = (msg) => {
    if (msg.data.request.action === 'renderDataList') {
      const listName = msg.data.request.name;
      const lang = msg.data.request.lang;
      const callback = () =>
        renderDataList(listName, msg.data.result ? msg.data.html : '', lang);

      executeWhenNotScrolling(callback);
    }
  };
};

/*-----------------------------------------------------------------------------------------------*/

const setDetails = function setDetails(details) {
  if (details.classList.contains('togglerSet')) return false;

  //Toggle event on details element doesn't bubble, so we cant delegate it
  details.addEventListener('toggle', () => {
    if (details.open)
      setTimeout(() => {
        details.closest('.scrollable').scroll({
          top: details.offsetTop,
          behavior: 'smooth',
        });
      }, 200);
  });

  details.querySelector('summary').dataset.count =
    details.querySelectorAll('li').length;

  details.classList.add('togglerSet');
};

/*-----------------------------------------------------------------------------------------------*/

const setBGColor = function setBGColor(color) {
  const hsl = HexToHSL(color);

  context.state.baseColor = color;
  context.state.invertedColor = invertColor(color);

  persistState();

  document.documentElement.style.setProperty('--base-color-H', hsl[0]);
  document.documentElement.style.setProperty('--base-color-S', `${hsl[1]}%`);
  document.documentElement.style.setProperty('--base-color-L', `${hsl[2]}%`);
  document.documentElement.style.setProperty(
    '--inverted-color',
    context.state.invertedColor,
  );
};

/*-----------------------------------------------------------------------------------------------*/

const setLang = function setLang(lang) {
  document.querySelector('html').setAttribute('lang', lang);

  document.querySelectorAll('[lang]').forEach((el) => {
    if (el.getAttribute('lang') === lang) {
      if (el.dataset.tabindex) el.setAttribute('tabindex', el.dataset.tabindex);
      el.removeAttribute('aria-hidden');
      el.removeAttribute('hidden');
      el.removeAttribute('disabled');
      el.removeAttribute('inert');
    } else {
      if (el.hasAttribute('tabindex'))
        el.dataset.tabindex = el.getAttribute('tabindex');
      el.removeAttribute('tabindex');
      el.setAttribute('aria-hidden', true);
      el.toggleAttribute('hidden', true);
      el.toggleAttribute('disabled', true);
      el.toggleAttribute('inert', true);
    }
  });
  context.state.lang = lang;
  persistState();

  resetSearch();
};

/*-----------------------------------------------------------------------------------------------*/

const persistState = function persistState() {
  localStorage.setItem(context.domain, JSON.stringify(context.state));
};

/*-----------------------------------------------------------------------------------------------*/

const setDates = function setDates(container) {
  return import(config.urls.libs.dayjs).then(() =>
    softExec(() => {
      const dates = container.querySelectorAll('[data-datestart]');

      dates.forEach((el) => {
        const lang = el.getAttribute('lang');
        const day = el.getAttribute('data-dateend')
          ? // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
            dayjs(el.getAttribute('data-dateend'))
          : // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
            dayjs(new Date());
        const diff = day.diff(el.getAttribute('data-datestart'), 'month');
        const years = Math.floor(diff / 12);
        const months = diff % 12 > 0 ? diff - years * 12 + 1 : 0;

        html(el, formatDate(years, months, lang));
      });
    }),
  );
};

/*-----------------------------------------------------------------------------------------------*/

const formatDate = function formatDate(years, months, lang) {
  const tmplYears = (y) =>
    y === 1
      ? lang === 'en'
        ? '1 year'
        : '1 anno'
      : y > 1
        ? lang === 'en'
          ? `${y} years`
          : `${y} anni`
        : '';

  const tmplMonths = (m) =>
    m === 1
      ? lang === 'en'
        ? '1 month'
        : '1 mese'
      : m > 1
        ? lang === 'en'
          ? `${m} months`
          : `${m} mesi`
        : '';

  const tmpl = (y, m) => {
    const years = m === 12 ? tmplYears(y + 1) : tmplYears(y);
    const months = m < 12 ? tmplMonths(m) : '';

    return `${years.length > 0 ? years : ''}${
      months.length > 0 ? (years.length > 0 ? ', ' : '') + months : ''
    }`;
  };

  return tmpl(years, months);
};

/*-----------------------------------------------------------------------------------------------*/

const setMenu = function setMenu() {
  const menu = context.elementsCache.sectionsMenu;
  const togglerMenu = document.getElementById('btnMenu');
  const list = menu.querySelector('menu');
  const tmpl = (values) =>
    `<li role="menuitem" data-sezione="${values.id}" data-index="${values.index}" class="${values.class}" lang="${values.lang}"${values.hidden}><a href="#${values.id}"${values.tabindex}>${values.caption}</a></li>`;
  const scrollingContainer = context.elementsCache.scrollingContainer;

  const toggleMenu = (state) => {
    if (typeof state !== 'undefined') menu.toggleAttribute('open', state);
    else menu.toggleAttribute('open');

    executeWhenNotAnimating(menu, () => {
      list.setAttribute('aria-expanded', menu.hasAttribute('open'));
      menu.setAttribute('tabindex', menu.hasAttribute('open') ? '0' : '-1');
      menu.setAttribute('aria-hidden', !menu.hasAttribute('open'));
      menu.toggleAttribute('hidden', !menu.hasAttribute('open'));
      menu.toggleAttribute('inert', !menu.hasAttribute('open'));
    });

    if (menu.hasAttribute('open')) {
      list.focus();
      setTimeout(
        () =>
          document.body.addEventListener(
            'click',
            () => {
              toggleMenu(false);
            },
            { once: true },
          ),
        200,
      );
    } else resetSearch();
  };

  let menuHtml = '';

  context.languages.forEach((lang) => {
    let i = 1;
    Object.entries(context.dynaContent.slides[lang]).forEach((entry) => {
      const [name, section] = entry;
      const liHtml = tmpl({
        id: name,
        index: i,
        lang: lang,
        hidden:
          lang !== context.state.lang ? ' hidden inert aria-hidden="true"' : '',
        tabindex:
          lang !== context.state.lang ? ' data-tabindex="0"' : ' tabindex="0"',
        class: '',
        caption: section.title,
      });
      menuHtml += liHtml;
      i += 1;
    });
  });

  html(list, menuHtml);

  togglerMenu.addEventListener('click', (evt) => {
    evt.stopPropagation();
    toggleMenu();
  });

  menu.addEventListener('click', (evt) => {
    evt.stopPropagation();
  });

  list.addEventListener('click', (evt) => {
    const el = evt.target;
    if (el.nodeName === 'A') {
      evt.stopPropagation();
      evt.preventDefault();

      const section = el.getAttribute('href').substring(1);

      context.elementsCache.scrollingContainer.classList.add('activating');

      navigate(section).then(() =>
        executeWhenNotScrolling(() =>
          setHash(el.getAttribute('href').substring(1)),
        ),
      );
    }
  });

  scrollingContainer.addEventListener('show', (evt) => {
    const el = evt.detail;
    menu
      .querySelectorAll(`li[data-sezione="${el.getAttribute('data-sezione')}"]`)
      .forEach((menuItem) => menuItem.classList.add('is-visible'));
  });

  scrollingContainer.addEventListener('hide', (evt) => {
    const el = evt.detail;
    menu
      .querySelectorAll(`li[data-sezione="${el.getAttribute('data-sezione')}"]`)
      .forEach((menuItem) => menuItem.classList.remove('is-visible'));
  });
};

/*-----------------------------------------------------------------------------------------------*/

const setActiveSectionByIndex = function setActiveSectionByIndex(index) {
  const section = context.elementsCache.scrollingContainer.querySelector(
    `li[data-index="${index}"]`,
  );

  if (section) return setActiveSection(section.dataset.sezione);
};

/*-----------------------------------------------------------------------------------------------*/

const setActiveSection = function setActiveSection(id) {
  return new Promise((resolve) => {
    const scrollingContainer = context.elementsCache.scrollingContainer;
    const slideActive = scrollingContainer.querySelector(
      'li.expanded[data-sezione]',
    );
    const slideToActivate = scrollingContainer.querySelector(
      `li[data-sezione="${id}"]`,
    );

    if (!slideToActivate) return false;

    const latence =
      (Math.abs(
        slideToActivate.dataset.index -
          (slideActive ? slideActive.dataset.index : 1),
      ) +
        1) *
      100;

    softExec(() => {
      const maximizedSlide =
        context.elementsCache.scrollingContainer.querySelector('.maximized');

      if (maximizedSlide) toggleMaximizeSlide(maximizedSlide, false);

      slideToActivate.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });

      executeWhenNotScrolling(() => {
        if (id === 'contattami')
          setTimeout(() => {
            scrollingContainer.scrollLeft = scrollingContainer.scrollWidth;
          }, 250);

        setTimeout(() => {
          executeWhenNotScrolling(() => {
            nextFrame(() => {
              if (slideActive) slideActive.classList.remove('expanded');
              slideToActivate.classList.add('expanded');
            });
          });

          document.title = `${
            context.dynaContent.slides[context.state.lang][id].title
          } | ${context.labels[context.state.lang].title}`;

          const evt = new CustomEvent('sectionActivated', {
            detail: slideToActivate,
          });
          scrollingContainer.dispatchEvent(evt);

          setTimeout(() => {
            scrollingContainer.classList.remove('activating');

            slideToActivate.addEventListener(
              'hide',
              () => {
                if (
                  location.hash === `#${id}` &&
                  !scrollingContainer.classList.contains('activating')
                ) {
                  resetHash();
                }
              },
              { once: true },
            );

            scrollingContainer.addEventListener(
              'scroll',
              () => {
                nextFrame(() => {
                  slideToActivate.classList.remove('expanded');
                });
              },
              { once: true },
            );

            resolve();
          }, 500);
        }, latence);
      });
    });
  });
};

/*-----------------------------------------------------------------------------------------------*/

const setHash = function setHash(hash) {
  if (
    context.elementsCache.scrollingContainer.querySelector(
      `li[data-sezione="${hash}"]`,
    ) &&
    `#${hash}` !== location.hash
  ) {
    document.title = `${
      context.dynaContent.slides[context.state.lang][hash].title
    } | ${context.labels[context.state.lang].title}`;

    history.pushState('', '', `${location.pathname}${location.search}#${hash}`);
  }
};

/*-----------------------------------------------------------------------------------------------*/

const resetHash = function resetHash() {
  if (location.hash) {
    history.pushState(
      '',
      '',
      `${location.pathname}${location.search}${location.hash}`,
    );

    history.replaceState(
      { scrollLeft: context.elementsCache.scrollingContainer.scrollLeft },
      '',
      `${location.pathname}${location.search}`,
    );

    document.title = context.labels[context.state.lang].title;
  }
};

/*-----------------------------------------------------------------------------------------------*/

const navigate = function navigate(section) {
  const id =
    section ||
    (location.hash ? location.hash.substring(1).toLowerCase() : null);

  if (
    id &&
    context.elementsCache.scrollingContainer.querySelector(
      `li[data-sezione="${id}"]`,
    )
  )
    return setActiveSection(id);
};

/*-----------------------------------------------------------------------------------------------*/

const renderDataList = function renderDataList(name, content, lang) {
  const evtDetail = { name: name, lang: lang, error: null };
  const throwEvent = () => {
    const evt = new CustomEvent('datalistRendered', { detail: evtDetail });
    context.elementsCache.scrollingContainer.dispatchEvent(evt);
  };
  const container = context.elementsCache.scrollingContainer.querySelector(
    `[data-dblist='${name}'][lang='${lang}']`,
  );

  container.querySelector('.loadingText').remove();
  html(container, content, true);

  if (
    container.nodeName === 'DETAILS' &&
    !container.classList.contains('togglerSet')
  )
    setDetails(container);
  else if (container.closest('details:not(.togglerSet)'))
    setDetails(container.closest('details:not(.togglerSet)'));
  else
    container
      .querySelectorAll('details:not(.togglerSet)')
      .forEach((details) => setDetails(details));

  container.classList.add('rendered');
  throwEvent();
};

/*-----------------------------------------------------------------------------------------------*/

const setSearch = function setSearch() {
  const menu = context.elementsCache.sectionsMenu;
  const txtsSearch = menu.querySelectorAll("[type='search']");

  txtsSearch.forEach((txt) => {
    const container = txt.closest('search');
    const debouncedSearch = debounce(() => search(txt.value), 400);

    txt.addEventListener('keyup', (evt) => {
      evt.stopPropagation();
      evt.preventDefault();
      if (evt.key === 'Escape') resetSearch();
    });
    txt.addEventListener('keypress', (evt) => {
      if (
        container.classList.contains('searching') ||
        container.classList.contains('indexing')
      ) {
        evt.stopPropagation();
        evt.preventDefault();
      }
    });

    txt.addEventListener('input', (evt) => {
      if (
        container.classList.contains('searching') ||
        container.classList.contains('indexing')
      ) {
        evt.stopPropagation();
        evt.preventDefault();
        return false;
      }

      if (menu.classList.contains('searchActive')) debouncedSearch();
      else setSearchActive().then(debouncedSearch);
    });

    container.addEventListener('click', (evt) => {
      const el = evt.target;

      if (
        el.classList.contains('clearResults') ||
        el.classList.contains('prevResult') ||
        el.classList.contains('nextResult')
      ) {
        evt.stopPropagation();
        evt.preventDefault();

        if (el.classList.contains('clearResults')) softExec(resetSearch, 1000);
        else if (el.classList.contains('prevResult'))
          softExec(() => goToResult('prev'), 1000);
        else if (el.classList.contains('nextResult'))
          softExec(() => goToResult('next'), 1000);
      }
    });
  });
};

/*-----------------------------------------------------------------------------------------------*/

const setSearchActive = function setSearchActive() {
  context.elementsCache.scrollingContainer.classList.add('searchActive');

  const menu = context.elementsCache.sectionsMenu;
  const container = menu.querySelector(`search[lang='${context.state.lang}']`);
  const controls = container.querySelector('.searchControls');
  const toggler = document.querySelector(
    `section[lang='${context.state.lang}']  .togglerPastSkills`,
  );

  const set = (resolve) => {
    controls.toggleAttribute('disabled', false);
    controls.toggleAttribute('hidden', false);
    controls.toggleAttribute('inert', false);
    controls.toggleAttribute('aria-hidden', false);
    toggler.dataset.prevstate = toggler.checked;
    toggler.checked = true;

    controls
      .querySelectorAll('a')
      .forEach((a) => a.setAttribute('tabindex', 0));

    menu.classList.add('searchActive');
    return resolve();
  };

  return new Promise((resolve) => {
    if (context.search?.[context.state.lang]) set(resolve);
    else setSearchEngine().then(set(resolve));
  });
};

/*-----------------------------------------------------------------------------------------------*/

const setSearchEngine = function setSearchEngine() {
  const menu = context.elementsCache.sectionsMenu;
  const container = menu.querySelector(`search[lang='${context.state.lang}']`);
  context.search = context.search || {};
  const setEngine = (lang, resolve) => {
    import(config.urls.libs.markjs).then(() => {
      context.search[lang] = context.search[lang] || {
        instance: new Mark(
          context.elementsCache.scrollingContainer.querySelectorAll(
            `section[data-sezione][lang="${lang}"]`,
          ),
        ),
        results: [],
        cursor: 0,
      };

      container.classList.remove('indexing');

      resolve();
    });
  };

  container.classList.add('indexing');

  return new Promise((resolve) => {
    if (isAllDynaContentLoaded(context.state.lang)) {
      softExec(() => setEngine(context.state.lang, resolve));
    } else
      softExec(() =>
        loadAllDynaContent(context.state.lang).then(
          softExec(() => setEngine(context.state.lang, resolve)),
        ),
      );
  });
};

/*-----------------------------------------------------------------------------------------------*/

const resetSearch = function resetSearch() {
  const menu = context.elementsCache.sectionsMenu;
  const container = menu.querySelector(`search[lang='${context.state.lang}']`);
  const txtSearch = container.querySelector(`[type='search']`);
  const controls = container.querySelector('.searchControls');
  const label = container.querySelector('label');
  const toggler = document.querySelector(
    `section[lang='${context.state.lang}']  .togglerPastSkills`,
  );

  context.elementsCache.scrollingContainer.classList.remove('searchActive');

  toggler.checked = toggler.dataset.prevstate !== 'false';

  controls.toggleAttribute('disabled', true);
  controls.toggleAttribute('aria-hidden', true);
  controls.toggleAttribute('hidden', true);
  controls.toggleAttribute('inert', true);
  controls.querySelectorAll('a').forEach((a) => a.setAttribute('tabindex', -1));
  container.classList.remove('searching');
  container.dataset.nrresults = '0';
  html(label, context.labels[lang].nrtrovati(0, 0));
  txtSearch.value = '';

  if (context.search?.[context.state.lang]) {
    context.search[context.state.lang].instance.unmark();
    context.search[context.state.lang].results = [];
    context.search[context.state.lang].cursor = 0;
  }

  menu.classList.remove('searchActive');
};

/*-----------------------------------------------------------------------------------------------*/

const search = function search(terms) {
  const searchEngine = context.search?.[context.state.lang];

  if (!searchEngine) return false;
  const menu = context.elementsCache.sectionsMenu;
  const container = menu.querySelector(`search[lang='${context.state.lang}']`);
  const label = container.querySelector('label');

  container.classList.add('searching');

  resetHash();

  if (!terms) {
    searchEngine.instance.unmark();
    searchEngine.results = [];
    searchEngine.cursor = 0;
    container.dataset.nrresults = '0';
    html(label, context.labels[lang].nrtrovati(0, 0));
    container.classList.remove('searching');
    return false;
  }

  const config = {
    separateWordSearch: true,
    diacritics: true,
    caseSensitive: false,
    ignoreJoiners: true,
    wildcards: 'enabled',
    done: () => {
      searchEngine.results =
        context.elementsCache.scrollingContainer.querySelectorAll(
          `section[data-sezione][lang="${context.state.lang}"] mark`,
        );
      searchEngine.cursor = 0;
      container.dataset.nrresults = searchEngine.results.length;
      container.classList.remove('searching');
      setActiveResult();
    },
  };

  searchEngine.instance.unmark({
    done: () => {
      searchEngine.instance.mark(terms, config);
    },
  });
};

/*-----------------------------------------------------------------------------------------------*/

const goToResult = function goToResult(dir) {
  const lang = context.state.lang;
  const searchEngine = context.search[lang];

  if (searchEngine.results.length < 1) return false;

  const newIndex =
    dir && dir === 'prev'
      ? searchEngine.cursor === 0
        ? searchEngine.results.length - 1
        : searchEngine.cursor - 1
      : searchEngine.cursor === searchEngine.results.length - 1
        ? 0
        : searchEngine.cursor + 1;

  executeWhenNotScrolling(() => setActiveResult(newIndex));
};

/*-----------------------------------------------------------------------------------------------*/

const setActiveResult = function setActiveResult(index) {
  const lang = context.state.lang;
  const scrollingContainer = context.elementsCache.scrollingContainer;
  const searchControlsContainer = document.querySelector(
    `search[lang="${lang}"]`,
  );
  const searchEngine = context.search[lang];
  const activeIndex = index || 0;
  const container = document.querySelector(`search[lang="${lang}"]`);
  const label = container.querySelector('label');

  if (
    searchEngine.results.length < 1 ||
    activeIndex > searchEngine.results.length - 1
  ) {
    html(label, context.labels[lang].nrtrovati(0, 0));
    return false;
  }

  searchControlsContainer.classList.add('searching');

  let blockStart = 'nearest';

  const itemActive = searchEngine.results.item(searchEngine.cursor);
  const itemToActivate = searchEngine.results.item(activeIndex);
  const details = itemToActivate.closest('details');
  const figure = itemToActivate.closest('figure');
  const slide = itemToActivate.closest('.slide');

  const callback = () => {
    if (details && !details.getAttribute('open')) {
      details.toggleAttribute('open', true);
    }

    if (figure) {
      const li = figure.closest('li');
      li.focus();
      blockStart = 'start';
    }

    softExec(() =>
      itemToActivate.scrollIntoView({
        behavior: 'smooth',
        block: blockStart,
        inline: 'nearest',
      }),
    );

    searchControlsContainer.classList.remove('searching');
  };

  itemActive.classList.remove('active');
  itemToActivate.classList.add('active');
  searchEngine.cursor = activeIndex;
  html(
    label,
    context.labels[lang].nrtrovati(
      searchEngine.results.length,
      activeIndex + 1,
    ),
  );

  scrollingContainer.addEventListener('sectionActivated', callback, {
    once: true,
  });

  executeWhenNotScrolling(() => setActiveSection(slide.dataset.sezione));
};

/*-----------------------------------------------------------------------------------------------*/

const executeWhenNotScrolling = function executeWhenNotScrolling(callback) {
  if (context.elementsCache.scrollingContainer.classList.contains('scrolling'))
    context.elementsCache.scrollingContainer.addEventListener(
      'scrollStop',
      () => softExec(callback),
      {
        once: true,
      },
    );
  else softExec(callback);
};

/*-----------------------------------------------------------------------------------------------*/

const executeWhenNotAnimating = function executeWhenNotAnimating(
  element,
  callback,
) {
  Promise.all(
    element
      .getAnimations({ subtree: true })
      .map((animation) => animation.finished),
  ).then(() => softExec(callback));
};

/*-----------------------------------------------------------------------------------------------*/

const setDraggableList = async function setDraggableList(list, lang) {
  const draggedItem = (e) =>
    e.target.classList.contains('drag-item')
      ? e.target
      : e.target.closest('.drag-item');
  const prevent = (e) => {
    if (draggedItem(e)) {
      e.stopPropagation();
    }
  };

  list.addEventListener('mousedown', prevent, { passive: false });
  list.addEventListener('mouseup', prevent, { passive: false });
  list.addEventListener('mousemove', prevent, { passive: false });

  const { setDraggable } = await import(config.urls.libs.draggablelistjs);

  softExec(() => {
    setDraggable(list);
    list.previousSibling.innerHTML = context.labels[lang].sceglisezioni;
  });
};

/*-----------------------------------------------------------------------------------------------*/

const setCV = function setCV(slide) {
  if (!hasTouch())
    setDraggableList(slide.querySelector('ul'), slide.getAttribute('lang'));

  slide.addEventListener('change', (e) => {
    const chk = e.target;

    if (!chk.dataset || !chk.dataset.rel || chk.dataset.rel !== 'cv')
      return true;

    const li = chk.closest('li');

    if (li.classList.contains('drag-item'))
      li.querySelectorAll("ul [type='checkbox']").forEach((chkChild) => {
        chkChild.checked = chk.checked;
      });
    else {
      const liRoot = li.closest('li.drag-item');
      const chkRoot = liRoot.querySelector("[type='checkbox']");
      const ul = liRoot.querySelector('ul');
      const nrChecked = ul.querySelectorAll("[type='checkbox']:checked").length;

      chkRoot.checked = chkRoot.disabled || nrChecked > 0;
    }
  });
};

/*-----------------------------------------------------------------------------------------------*/

const downloadCV = async function downloadCV() {
  const sezione = context.elementsCache.scrollingContainer.querySelector(
    `section[data-sezione='cv'][lang='${context.state.lang}']`,
  );
  sezione.classList.add('loading');

  const { buildPDF } = await import(config.urls.modules.cv);

  Promise.allSettled([
    fetchResource(config.urls.libs.dompurify, 'js', 'domPurify'),
    /*fetchResource(config.urls.libs.html2canvas, 'js', 'html2canvas'),*/
    /*fetchResource(config.urls.libs.jspdfhtml2canvas, 'js', 'jspdfhtml2canvas'),*/
    fetchResource(config.urls.libs.jspdf, 'js', 'jsPDF'),
    loadAllDynaContent(context.state.lang),
  ])
    .then(() => {
      buildPDF(context.state.lang)
        .then(() =>
          notify(context.labels[context.state.lang].downloadStarted, 'success'),
        )
        .catch(() => notify(context.labels[context.state.lang].error, 'error'))
        .finally(() => sezione.classList.remove('loading'));
    })
    .catch(() => {
      notify(context.labels[context.state.lang].error, 'error');
      sezione.classList.remove('loading');
    });
};

/*-----------------------------------------------------------------------------------------------*/

const sendMsg = async function sendMsg(form) {
  if (!form) return false;

  if (self.navigator.onLine) {
    const sezione = context.elementsCache.scrollingContainer.querySelector(
      `section[data-sezione='contattami'][lang='${context.state.lang}']`,
    );
    sezione.classList.add('loading');

    const { sendMessage } = await import(config.urls.modules.contactme);

    sendMessage(form)
      .then(() => {
        notify(context.labels[context.state.lang].messageSent, 'success');
        form.reset();
      })
      .catch((result) => {
        notify(context.labels[context.state.lang].error, 'error');
        // biome-ignore lint/nursery/noConsole: <explanation>
        console.warn(result);
      })
      .finally(() => {
        sezione.classList.remove('loading');
      });
  } else {
    notify(context.labels[context.state.lang].offlineTryLater, 'warning');
  }
};

/*-----------------------------------------------------------------------------------------------*/

const notify = (text, type) => {
  const notifications = document.querySelector('ui-notifications');

  if (notifications) notifications.add(text, type);
  else {
    import(config.urls.libs.notificationsjs).then(() => {
      if (!document.querySelector('ui-notifications'))
        document.body.insertAdjacentHTML(
          'beforeend',
          '<ui-notifications role="alert" aria-live="assertive" aria-atomic="true" aria-relevant="additions"></ui-notifications>',
        );

      document.querySelector('ui-notifications').add(text, type);
    });
  }
};

/*-----------------------------------------------------------------------------------------------*/

const toggleMaximizeSlide = (slide, state) => {
  if (!slide) return false;

  const setState = () => {
    slide.classList.toggle('expanded', true);

    const chk = slide.querySelector('.chkMaximize');
    chk.checked = state;
    chk.setAttribute('aria-expanded', state);
    slide.classList.toggle('maximized', state);
  };

  if (!document.startViewTransition) setState();
  else document.startViewTransition(setState);

  if (state)
    window.history.pushState(
      { maximizedSlide: true },
      context.dynaContent.slides[context.state.lang][slide.dataset.sezione]
        .title,
    );
  else window.history.back();
};

/*-----------------------------------------------------------------------------------------------*/

setup();
