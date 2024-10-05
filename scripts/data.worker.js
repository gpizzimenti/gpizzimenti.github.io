import { esclusioni } from '../data/eventi/esclusioni.min.js';
import iCalDateParser from './lib/icsUtils/iCalDateParser.min.js';
/*import icsToJson from './lib/icsUtils/icsToJson.min.js';*/

/*-----------------------------------------------------------------------------------------------*/

self.context = {};

self.context.labels = {
  it: {
    autori: 'Autore',
    piattaforme: 'Ente erogatore',
    certificati: 'Certificato',
  },
  en: {
    autori: 'Author',
    piattaforme: 'Learning Platform',
    certificati: 'Certificate',
  },
};

/*-----------------------------------------------------------------------------------------------*/

self.onmessage = (msg) => {
  const result = { result: false };

  try {
    if (!msg?.data?.action) {
      result.msg = 'Missing parameters';
      self.postMessage(result);
    } else {
      result.request = msg.data;

      if (msg.data.action === 'renderDataList') {
        renderDataList(msg.data.datasources, msg.data.lang)
          .then((res) => {
            result.html = res;
            result.result = true;
            self.postMessage(result);
          })
          .catch((error) => {
            errorMessage(`onmessage: ${error}`, result);
          });
      } else {
        result.html = '';
        errorMessage('onmessage: Invalid action', result);
      }
    }
  } catch (exc) {
    errorMessage(`onmessage: ${exc}`, result);
  }
};

/*-----------------------------------------------------------------------------------------------*/

const errorMessage = function errorMessage(msg, result) {
  console.error(msg);
  result.result = false;
  result.msg = msg;
  self.postMessage(result);
};

/*-----------------------------------------------------------------------------------------------*/

const renderDataList = async function renderDataList(datasources, lang) {
  return new Promise((resolve, reject) => {
    const requests = datasources.map((ds) =>
      fetch(ds).then((res) => (ds.endsWith('ics') ? res.text() : res.json())),
    );

    Promise.allSettled(requests)
      .then((results) => {
        const html = renderExpandables(elaborateData(results), lang);
        resolve(html);
      })
      .catch((error) => {
        console.error(`renderDataList: ${error}`);
        reject(error);
      });
  });
};

/*-----------------------------------------------------------------------------------------------*/

const elaborateData = (results) => {
  const elaboratedResult = {};

  results.forEach((result) => {
    if (result?.value) {
      const source = eventiSource(result.value);

      const list =
        source === 'EventBrite'
          ? result.value.orders
          : source === 'Codemotion'
            ? result.value.data.data
            : source === 'GCalendar'
              ? //? icsToJson(result.value)
                result.value?.VCALENDAR[0]?.VEVENT
              : result.value;

      list.forEach((el) => {
        const evento = parseEvento(el, source);

        if (evento) {
          if (!esclusioni.includes(evento.id)) {
            const year = evento.inizio.getFullYear();
            const yearList = elaboratedResult[year] || [];

            if (!findEvento(evento, yearList)) {
              yearList.push(evento);
              elaboratedResult[year] = yearList;
            }
          }
        }
      });
    }
  });

  Object.keys(elaboratedResult).forEach((anno) =>
    orderListEventiByDateReverse(elaboratedResult[anno]),
  );

  return elaboratedResult;
};

/*-----------------------------------------------------------------------------------------------*/

const eventiSource = (eventi) => {
  return eventi.VCALENDAR //|| eventi.constructor === 'txt'.constructor //ics
    ? 'GCalendar'
    : eventi.orders
      ? 'EventBrite'
      : eventi.data
        ? 'Codemotion'
        : null;
};

/*-----------------------------------------------------------------------------------------------*/

const findEvento = (evento, yearList) => {
  return (
    (evento.id && yearList.find((evt) => evt.id === evento.id)) ||
    (evento.ids?.EventBrite &&
      yearList.find(
        (evt) => evt.ids && evt.ids?.EventBrite === evento.ids.EventBrite,
      )) ||
    (evento.ids?.Codemotion &&
      yearList.find(
        (evt) => evt.ids && evt.ids?.Codemotion === evento.ids.Codemotion,
      )) ||
    (evento.ids?.GCalendar &&
      yearList.find(
        (evt) => evt.ids && evt.ids?.GCalendar === evento.ids.GCalendar,
      ))
  );
};

/*-----------------------------------------------------------------------------------------------*/

const parseEvento = (el, source) => {
  let evento = null;

  switch (source) {
    case 'EventBrite':
      evento = parseEventoEventBrite(el);
      break;
    case 'Codemotion':
      evento = parseEventoCodemotion(el);
      break;
    case 'GCalendar':
      evento = parseEventoGCalendar(el);
      break;
    default:
      evento = parseEventoCustom(el);
  }

  return evento;
};
/*-----------------------------------------------------------------------------------------------*/

const parseEventoEventBrite = (el) => {
  let evento = {};
  try {
    evento.source = 'EventBrite';
    evento.id = `EventBrite:${el.event.id}`;
    evento.ids = el.event.ids || { EventBrite: el.event.id };
    evento.titolo = clean(el.event.name.text);
    evento.testo = clean(el.event.description.text);
    evento.inizio = new Date(el.event.start.utc);
    evento.fine = new Date(el.event.end.utc);
    evento.link = el.event.vanity_url || el.event.url;

    if (el.event.codemotion_id) evento.ids.Codemotion = el.event.codemotion_id;

    formatDateRange(evento);
  } catch (exc) {
    evento = null;
    console.warn(`parseEventoEventBrite: ${exc} - ${JSON.stringify(el)}`);
  }

  return evento;
};

/*-----------------------------------------------------------------------------------------------*/

const parseEventoCodemotion = (el) => {
  let evento = {};
  try {
    evento.source = 'Codemotion';
    evento.piattaforme = [
      { nome: 'Codemotion', link: 'https://www.codemotion.com/' },
    ];
    evento.id = `Codemotion:${el.event.uuid}`;
    evento.ids = el.event._ids || { Codemotion: el.event.uuid };
    evento.titolo = clean(el.event.name);
    evento.testo = clean(el.event.description);
    evento.inizio = new Date(el.event.start_datetime);
    evento.fine = new Date(el.event.end_datetime);

    if (el.event.type === 'online_conference')
      evento.link = `https://events.codemotion.com/conferences/online/${evento.inizio.getFullYear()}/${
        el.event.slug
      }`;
    else if (el.event.type === 'webinar')
      evento.link = `https://events.codemotion.com/webinars/${el.event.slug}`;

    if (el.event.eventbrite_id) evento.ids.EventBride = el.event.eventbride_id;

    formatDateRange(evento);
  } catch (exc) {
    evento = null;
    console.warn(`parseEventoCodemotion: ${exc} - ${JSON.stringify(el)}`);
  }

  return evento;
};

/*-----------------------------------------------------------------------------------------------*/

const parseEventoGCalendar = (el) => {
  let evento = {};
  //if (el.SUMMARY === 'Front-end development:presente e futuro') debugger;

  try {
    evento.source = 'GCalendar';
    evento.id = `GCalendar:${el.UID || el.UUID}`;
    evento.ids = { GCalendar: el.UID || el.UUID };
    evento.titolo = el.SUMMARY ? clean(el.SUMMARY) : '';
    evento.testo = el.DESCRIPTION ? clean(el.DESCRIPTION) : '';

    const startDate =
      el.startDate ||
      Object.entries(el).find(([k, v]) => k.startsWith('DTSTART'))?.[1];
    const endDate =
      el.endDate ||
      Object.entries(el).find(([k, v]) => k.startsWith('DTEND'))?.[1] ||
      startDate;

    evento.inizio = startDate ? new Date(iCalDateParser(startDate)) : null;
    evento.fine = endDate ? new Date(iCalDateParser(endDate)) : null;

    evento.link = isValidUrl(el.URL)
      ? el.URL
      : isValidUrl(el.LOCATION)
        ? el.LOCATION
        : isValidUrl(el.DESCRIPTION)
          ? el.DESCRIPTION
          : null;

    formatDateRange(evento);

    /*if (
      (el.LOCATION && !isValidUrl(el.LOCATION)) ||
      (el.location && !isValidUrl(el.location))
    )
      evento.data = `${clean(el.LOCATION || el.location)}, ${evento.data}`;*/
  } catch (exc) {
    evento = null;
    console.warn(`parseEventoGCalendar: ${exc} - ${JSON.stringify(el)}`);
  }

  return evento;
};

/*-----------------------------------------------------------------------------------------------*/

const parseEventoCustom = (el) => {
  const evento = el;

  evento.source = 'Custom';
  evento.inizio = new Date(el.inizio);
  evento.fine = new Date(el.fine);

  return evento;
};

/*-----------------------------------------------------------------------------------------------*/

const removeHTMLTags = (str) => {
  if (!str) return null;

  return str.toString().replace(/(<([^>]+)>)/gi, '');
};

/*-----------------------------------------------------------------------------------------------*/

const isValidUrl = (urlString) => {
  if (!urlString) return false;

  try {
    return Boolean(new URL(urlString));
  } catch (e) {
    return false;
  }
};

/*-----------------------------------------------------------------------------------------------*/

const clean = (str) => {
  if (!str) return null;

  const ret = str
    .replace(/(\\r)|(\\n)/g, '&nbsp;')
    .replace(/(\r\n|\n|\r)/gm, '&nbsp;')
    .replace(/\\/g, '')
    .trim();

  return removeHTMLTags(ret);
};
/*-----------------------------------------------------------------------------------------------*/

function formatDateRange(evento) {
  evento.data = evento.inizio.toLocaleDateString('en-GB');

  if (evento.fine && evento.fine.toLocaleDateString('en-GB') !== evento.data) {
    if (evento.fine.getMonth() !== evento.inizio.getMonth())
      evento.data += `&nbsp;&dash;&nbsp;${evento.fine.toLocaleDateString(
        'en-GB',
      )}`;
    else
      evento.data = `${String(evento.inizio.getDate()).padStart(
        2,
        '0',
      )}&dash;${String(evento.fine.getDate()).padStart(2, '0')}/${String(
        evento.inizio.getMonth() + 1,
      ).padStart(2, '0')}/${evento.inizio.getFullYear()}`;
  }
}

/*-----------------------------------------------------------------------------------------------*/

const orderListEventiByDateReverse = (list) => {
  list.sort((evt1, evt2) => evt2.inizio - evt1.inizio);
};

/*-----------------------------------------------------------------------------------------------*/

const renderList = function renderList(data, lang) {
  if (data?.length && data.length > 0)
    return `<ul>${data.reduce((html, row) => {
      return html + renderRow(row, lang);
    }, '')}</ul>`;
  // biome-ignore lint/nursery/noUselessElse: <explanation>
  else return '';
};

/*-----------------------------------------------------------------------------------------------*/

const renderExpandable = function renderExpandable(data, name, label, lang) {
  const tmpl = (name, label, list) => `<details data-name="${name}">  
                  <summary><b>${label}</b></summary>
                  <div class="content rendered" data-dblist="${name}" lang="${lang}">${list}</div>
                </details>`;
  const html = tmpl(name, label, renderList(data, lang));

  return html;
};

/*-----------------------------------------------------------------------------------------------*/

const renderExpandables = function renderExpandables(elaboratedData, lang) {
  const years = Object.keys(elaboratedData);
  let html = '';

  years.sort((year1, year2) => year2 - year1);

  years.forEach((year) => {
    html += renderExpandable(
      elaboratedData[year],
      `eventi_${year}`,
      year,
      lang,
    );
  });

  return html;
};

/*-----------------------------------------------------------------------------------------------*/

const renderRow = function renderRow(data, lang) {
  const titolo = renderTitolo(data, lang);
  const testo = renderTesto(data, lang);
  const dataLocalita = renderData(data, lang);
  const relatori = renderSezione(data, lang, 'relatori');
  const piattaforme = renderSezione(data, lang, 'piattaforme');
  const certificati = renderSezione(data, lang, 'certificati');

  return `<li data-id="${data.id ? data.id : ''}" data-online="${
    data.online ? 'true' : 'false'
  }" data-source="${data.source ? data.source : ''}">
      ${titolo.html}
      ${testo.html}
      ${dataLocalita.html}
      ${relatori.html}
      ${piattaforme.html}
      ${certificati.html}
</li>`;
};

/*-----------------------------------------------------------------------------------------------*/

const renderTitolo = function renderTitolo(data, lang) {
  return {
    html: `<h5>
              ${
                data.link
                  ? `<a href="${data.link}" target="_blank" rel="nofollow noopener noreferrer">${data.titolo}</a>`
                  : data.titolo
              }
            </h5>`,
    text: data.titolo,
  };
};

/*-----------------------------------------------------------------------------------------------*/

const renderTesto = function renderTesto(data, lang) {
  return {
    html: data.testo ? `<p class="testo">${data.testo}</p>` : '',
    text: data.testo ? data.testo : '',
  };
};

/*-----------------------------------------------------------------------------------------------*/

const renderData = function renderData(data, lang) {
  return {
    html: data.data ? `<p class="data">${data.data}</p>` : '',
    text: data.data ? data.data : '',
  };
};

/*-----------------------------------------------------------------------------------------------*/

const renderSezione = (data, lang, section) => {
  if (!data[section]) return { html: '', text: '' };

  let testo = '';
  const elementi = data[section].reduce((html, elemento) => {
    const nome = elemento.nome
      ? elemento.nome
      : self.context.labels[lang][section];
    testo += testo ? ` ${nome}` : nome;

    if (elemento.link)
      return `${html}, <span><a href="${elemento.link}" target="_blank" rel="nofollow noopener noreferrer">${nome}</a></span>`;
    // biome-ignore lint/nursery/noUselessElse: <explanation>
    else return `${html}, <span>${nome}</span>`;
  }, '');

  return {
    html: `<p class="${section}">${elementi.substring(2)}</p>`,
    text: testo,
  };
};

/*-----------------------------------------------------------------------------------------------*/
