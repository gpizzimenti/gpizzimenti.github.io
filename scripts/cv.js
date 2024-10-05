import {
  fontGlyphs,
  fontItalic,
  fontRegular,
  fontSemiBold,
} from '../styles/fonts/cv/fonts.min.js';
import { unescapeHtml } from './lib/utils.min.js';

const meta = {
  title: 'Giuseppe Pizzimenti - Software Developer - CV',
  subject: 'Giuseppe Pizzimenti - Software Developer - Curriculum Vitae',
  author: 'Giuseppe Pizzimenti',
  keywords: 'cv, developer, programmer, frontend, backend, fullstack',
  creator: 'giuseppe.pizzimenti.dev',
};
const defaultColor = [4, 59, 93];
const settings = {
  marginX: 15,
  marginY: 17,
  wordSpacing: 1,
  lineSpacing: 2,
  titleSize: 26,
  subTitleSize: 16,
  headingSize: 12,
  bodySize: 10,
  footerSize: 8,
  accentColor: defaultColor,
  bodyColor: [40, 40, 40],
  title: 'Giuseppe Pizzimenti',
  subtitle: 'Software developer',
  email: 'giuseppe.pizzimenti@gmail.com',
  site: 'gpizzimenti.github.io',
  cellphone: '+39.XXX.XXXXXXX',
  fileName: 'Giuseppe_Pizzimenti_CV',
};

const cursor = {
  x: settings.marginX,
  y: settings.marginY,
};

let currentDoc = null;

/***************************************************************************** */

export async function buildPDF(lang) {
  return new Promise((resolve, reject) => {
    const { jsPDF } = window.jspdf;
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        compress: true,
      });

      currentDoc = doc;

      initDoc(doc);

      printSections(doc, lang);

      addPageFooter(doc, lang);

      downloadPDF(doc, lang);

      resolve();
    } catch (exc) {
      reject(exc);
    }
  });
}

/***************************************************************************** */

const initDoc = (doc) => {
  cursor.x = settings.marginX;
  cursor.y = settings.marginY;

  doc.setProperties(meta);

  setFonts(doc);

  addPageHeader(doc);
};

/***************************************************************************** */

const setFonts = (doc) => {
  doc.addFileToVFS('fontRegular.ttf', fontRegular);
  doc.addFont('fontRegular.ttf', 'fontRegular', 'normal');

  doc.addFileToVFS('fontSemiBold.ttf', fontSemiBold);
  doc.addFont('fontSemiBold.ttf', 'fontSemiBold', 'normal');

  doc.addFileToVFS('fontItalic.ttf', fontItalic);
  doc.addFont('fontItalic.ttf', 'fontItalic', 'normal');

  doc.addFileToVFS('fontGlyphs.ttf', fontGlyphs);
  doc.addFont('fontGlyphs.ttf', 'fontGlyphs', 'normal');
};

/***************************************************************************** */

const print = (doc, text, options) => {
  const txt = text || '';
  const opts = options || {};
  const color = opts.color || settings.bodyColor;
  const size = opts.size || settings.bodySize;
  const font = opts.font || 'fontRegular';
  let currentX = opts.x
    ? typeof opts.x === 'function'
      ? opts.x()
      : opts.x
    : cursor.x;
  let currentY = opts.y
    ? typeof opts.y === 'function'
      ? opts.y()
      : opts.y
    : cursor.y;

  doc.setFont(font);
  doc.setFontSize(size);
  doc.setTextColor(color[0], color[1], color[2]);

  const dims = doc.getTextDimensions(txt);

  if (
    !opts.force &&
    currentX + dims.w > doc.getPageWidth() - settings.marginX
  ) {
    currentX = opts.minX ? opts.minX : settings.marginX;
    currentY =
      cursor.y +
      dims.h +
      (opts.lineSpacing ? opts.lineSpacing : settings.lineSpacing);
  }

  if (!opts.force && currentY > doc.getPageHeight() - settings.marginY - size) {
    doc.addPage();
    currentY = settings.marginY;
  }

  if (opts.align && opts.align === 'right')
    currentX = doc.getPageWidth() - dims.w - settings.marginX;
  else if (opts.align && opts.align === 'center')
    currentX = doc.getPageWidth() / 2 - dims.w / 2;

  if (opts.border) {
    doc.roundedRect(
      currentX - 1.5,
      currentY - dims.h * 1.35,
      dims.w + 3,
      dims.h + 3,
      1,
      1,
      'S',
    );
  }

  if (opts.url)
    doc.textWithLink(txt, currentX, currentY, {
      url: opts.url,
    });
  else doc.text(txt, currentX, currentY);

  if (opts.underline) {
    doc.setLineWidth(0.2);
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.line(
      currentX,
      currentY + dims.h - 2,
      currentX + dims.w,
      currentY + dims.h - 2,
    );
  }

  cursor.x =
    currentX +
    dims.w +
    (opts.wordSpacing ? opts.wordSpacing : settings.wordSpacing);
  cursor.y = currentY;

  const ret = {
    x: currentX,
    y: currentY,
    w: dims.w,
    h: dims.h,
  };

  return ret;
};

/***************************************************************************** */

const println = (doc, text, options) => {
  const opts = options || {};
  const ret = print(doc, text, options);
  cursor.x = opts.x || settings.marginX;
  cursor.y =
    ret.y +
    ret.h +
    (opts.lineSpacing ? opts.lineSpacing : settings.lineSpacing);

  return ret;
};

/***************************************************************************** */

const printParagraph = (doc, text, options) => {
  let h = 0;
  let ret;

  const opts = options || {};

  const w =
    opts.w ||
    doc.getPageWidth() -
      (opts.x ? opts.x + settings.marginX : settings.marginX * 1.5);

  doc.setFontSize(opts.size || settings.bodySize);
  const lines = doc.splitTextToSize(text, w);

  for (const line of lines) {
    ret = println(doc, line, opts);
    // biome-ignore lint/performance/noDelete: <explanation>
    if (opts.y) delete opts.y; //solo la prima riga
    h += ret.h;
  }

  ret.w = w;
  ret.h = h;
  cursor.x = settings.marginX;
  cursor.y =
    ret.y + (opts.lineSpacing ? opts.lineSpacing : settings.lineSpacing);

  return ret;
};

/***************************************************************************** */

const printLi = (doc, text, options) => {
  const opts = options || {};
  const size = opts.size || settings.bodySize;
  const startX = opts.x || settings.marginX;

  if (!opts.force && cursor.y > doc.getPageHeight() - settings.marginY - size) {
    doc.addPage();
    cursor.y = settings.marginY;
  }

  const startY = cursor.y;

  doc.setTextColor(
    settings.accentColor[0],
    settings.accentColor[1],
    settings.accentColor[2],
  );
  doc.setFont('fontSemiBold');
  doc.setFontSize(settings.bodySize + 1);
  doc.text('•', startX, startY + 0.1);
  doc.setFont(opts.font || 'fontRegular');
  doc.setTextColor(
    settings.bodyColor[0],
    settings.bodyColor[1],
    settings.bodyColor[2],
  );
  doc.setFontSize(opts.size || settings.bodySize);

  opts.x = startX + 3;
  opts.y = startY;
  const ret = printParagraph(doc, text, opts);

  return ret;
};

/***************************************************************************** */

const printHeading = (doc, text, options) => {
  const ret = print(doc, text, {
    font: 'fontSemiBold',
    x: 32,
    y: cursor.y + settings.lineSpacing * 2,
    color: settings.accentColor,
    size: settings.headingSize,
  });

  doc.setLineWidth(0.4);
  doc.setDrawColor(
    settings.accentColor[0],
    settings.accentColor[1],
    settings.accentColor[2],
  );
  doc.line(settings.marginX, ret.y - ret.h / 3, 30, ret.y - ret.h / 3);

  cursor.x = settings.marginX;
  cursor.y += settings.lineSpacing * 3;

  return ret;
};

/***************************************************************************** */

const addPageHeader = (doc) => {
  const retTitle = print(doc, settings.title, {
    font: 'fontSemiBold',
    color: settings.accentColor,
    size: settings.titleSize,
  });

  doc.setFont('fontRegular');
  doc.setFontSize(settings.subTitleSize);

  const dimsSubTitle = doc.getTextDimensions(settings.subtitle);

  const retSubTitle = println(doc, settings.subtitle, {
    x: retTitle.w + retTitle.x - dimsSubTitle.w,
    y: retTitle.y + retTitle.h,
    color: settings.accentColor,
    size: settings.subTitleSize,
  });

  doc.setLineWidth(0.7);
  doc.setDrawColor(
    settings.accentColor[0],
    settings.accentColor[1],
    settings.accentColor[2],
  );
  doc.line(
    settings.marginX,
    retSubTitle.y - retSubTitle.h / 3,
    retSubTitle.x - 2,
    retSubTitle.y - retSubTitle.h / 3,
  );

  const retEmail = println(doc, settings.email, {
    align: 'right',
    y: settings.marginY - 5,
    color: settings.accentColor,
    url: `mailto:${settings.email}`,
  });

  const retSite = println(doc, settings.site, {
    y: retEmail.y + settings.lineSpacing * 3.5,
    x: retEmail.x,
    color: settings.accentColor,
    url: `https://${settings.site}`,
  });

  const retCellphone = println(doc, settings.cellphone, {
    y: retSite.y + settings.lineSpacing * 3.5,
    x: retEmail.x,
    color: settings.accentColor,
    url: `tel:${settings.cellphone.replaceAll('.', '')}`,
  });

  println(doc, 'e', {
    font: 'fontGlyphs',
    color: settings.accentColor,
    x: retEmail.x - 5,
    y: retEmail.y + 0.5,
  });

  println(doc, 'w', {
    font: 'fontGlyphs',
    color: settings.accentColor,
    x: retSite.x - 4.7,
    y: retSite.y,
    size: 9,
  });

  println(doc, 'c', {
    font: 'fontGlyphs',
    color: settings.accentColor,
    x: retCellphone.x - 4.1,
    y: retCellphone.y - 0.2,
    size: 9.5,
  });

  cursor.y += settings.lineSpacing * 3;
  cursor.x = settings.marginX;
};

/***************************************************************************** */

const addPageFooter = (doc, lang) => {
  const nrpages = doc.internal.getNumberOfPages();
  const date = new Date();
  const timestampStr = date.toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false,
    hour: 'numeric',
    minute: '2-digit',
  });

  for (let nr = 1; nr < nrpages + 1; nr++) {
    doc.setPage(nr);

    const startY = doc.getPageHeight() - settings.marginY / 2 + 1;

    const ret1 = print(doc, `https://${settings.site}/#cv`, {
      x: settings.marginX,
      y: startY - 0.2,
      force: true,
      size: settings.bodySize - 2,
      underline: true,
      color: settings.accentColor,
      url: `https://${settings.site}/#cv`,
    });

    print(doc, ` - ${timestampStr}`, {
      x: ret1.x + ret1.w,
      y: startY,
      force: true,
      color: settings.accentColor,
      size: settings.footerSize,
    });

    print(doc, `${nr} / ${nrpages}`, {
      y: startY,
      force: true,
      color: settings.accentColor,
      size: settings.footerSize,
      align: 'right',
    });
  }
};

/***************************************************************************** */

const printSections = (doc, lang) => {
  document
    .querySelectorAll(
      `main > ul > li:has([lang='${lang}']), article details .content`,
    )
    .forEach((el) => {
      el.style.contentVisibility = 'visible';
    });

  document
    .querySelectorAll(
      `section[data-sezione='cv'][lang='${lang}'] [type='checkbox'][data-rel='cv']:checked`,
    )
    .forEach((chk) => {
      if (sections[chk.value]) sections[chk.value](doc, lang);
    });
};

/***************************************************************************** */

const checkForBreak = (doc, withMsg) => {
  let startY = cursor.y;

  if (startY > doc.getPageHeight() - settings.marginY - settings.bodySize * 2) {
    if (withMsg)
      print(doc, '[cont.]', {
        y: startY,
        align: 'right',
        force: true,
        font: 'fontItalic',
        size: settings.bodySize - 1.5,
      });

    doc.addPage();
    startY = settings.marginY;
    cursor.y = startY;
  }

  return startY;
};

/***************************************************************************** */

const downloadPDF = (doc, lang) => {
  doc.save(
    `${settings.fileName}_${lang.toUpperCase()}_${new Date(Date.now())
      .toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour12: false,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      })
      .replaceAll(' ', '')
      .replaceAll(',', '_')
      .replaceAll('/', '')
      .replaceAll(':', '')}.pdf`,
  );
};

/******************************************************************************/

const sections = {};

/*-----------------------------------------------------------------------------*/

sections.chisono = (doc, lang) => {
  const pars = document.querySelectorAll(
    `section[data-sezione='chisono'][lang='${lang}'] p[data-cv='chisono']`,
  );

  let text = '';
  pars.forEach((par) => {
    text += `${unescapeHtml(par.innerHTML).replace(/\n/g, '')}\n`;
  });

  const retP = printParagraph(doc, text, { x: 0 });

  const startY = cursor.y;

  const retLi = print(doc, 'https://www.linkedin.com/in/giuseppepizzimenti', {
    x: settings.marginX + 5.5,
    font: 'fontSemiBold',
    url: 'https://www.linkedin.com/in/giuseppepizzimenti',
    underline: true,
    size: settings.bodySize - 1.2,
  });

  print(doc, 'i', {
    font: 'fontGlyphs',
    color: settings.accentColor,
    size: settings.bodySize + 3,
    x: settings.marginX,
    y: retLi.y + 0.7,
  });

  const retGi = print(doc, 'https://github.com/gpizzimenti', {
    x: retLi.x + retLi.w + 10,
    y: startY,
    font: 'fontSemiBold',
    url: 'https://github.com/gpizzimenti',
    underline: true,
    size: settings.bodySize - 1.2,
  });

  println(currentDoc, 'g', {
    font: 'fontGlyphs',
    color: settings.accentColor,
    size: settings.bodySize + 3,
    x: retGi.x - 5.5,
    y: retGi.y + 0.7,
  });
};

/*-----------------------------------------------------------------------------*/

sections.competenze = (doc, lang) => {
  let text = unescapeHtml(
    document.querySelector(
      `#titleSpecialties${lang.charAt(0).toUpperCase()}${lang.slice(1)}`,
    ).innerHTML,
  );
  printHeading(doc, text);

  const lis = document.querySelectorAll(
    `#listSpecialties${lang.charAt(0).toUpperCase()}${lang.slice(1)} li`,
  );

  for (const element of lis) {
    checkForBreak(doc, true);

    const li = element;
    text = `${unescapeHtml(li.innerHTML).replace(/\n/g, '')}\n`;

    printLi(doc, text);
  }
};

/*-----------------------------------------------------------------------------*/

sections.esperienza = (doc, lang) => {
  const text = unescapeHtml(
    document.querySelector(
      `#titleEsperienza${lang.charAt(0).toUpperCase()}${lang.slice(1)}`,
    ).innerHTML,
  );
  printHeading(doc, text);

  cursor.y += settings.lineSpacing;

  document
    .querySelectorAll(
      `section[data-sezione="esperienza"][lang="${lang}"] > article > ul > li`,
    )
    .forEach((li, idx, elems) => {
      const h = li.querySelector('h4');
      const url = h.querySelector('a');

      const place = `${unescapeHtml(h.innerHTML).replace(/\n/g, '')}`;

      const startY = checkForBreak(doc, true);

      const retLi = printLi(doc, `${place}\n`, {
        font: 'fontSemiBold',
        force: true /*,
        url: url ? url.getAttribute('href') : undefined,
        underline: !!url,*/,
      });

      if (url) {
        const dimsLi = doc.getTextDimensions(place);

        print(doc, '(', {
          force: true,
          size: settings.bodySize - 2,
          x: retLi.x + dimsLi.w + 1.5,
          y: startY - 0.2,
          font: 'fontItalic',
        });

        print(doc, url.getAttribute('href'), {
          url: url.getAttribute('href'),
          force: true,
          size: settings.bodySize - 2,
          y: startY - 0.2,
          font: 'fontItalic',
          underline: true,
        });

        print(doc, ')', {
          force: true,
          size: settings.bodySize - 2,
          y: startY - 0.2,
          font: 'fontItalic',
        });
      }

      const date = li.querySelector('summary > b');
      const text = `${unescapeHtml(date.innerHTML).replace(/\n/g, '')}`;
      const retDate = print(doc, text, {
        y: startY - 1,
        align: 'right',
        force: true,
        font: 'fontItalic',
        size: settings.bodySize - 1.5,
        color: settings.accentColor,
      });

      println(doc, 'a', {
        font: 'fontGlyphs',
        force: true,
        color: settings.accentColor,
        size: settings.bodySize - 1.3,
        x: retDate.x - 5,
        y: startY - 1,
      });

      if (
        document.querySelector(
          `section[data-sezione='cv'][lang='${lang}'] [type='checkbox'][value='sommari']:checked`,
        )
      ) {
        const p = li.querySelector('.content > p');
        const text = `${unescapeHtml(p.innerHTML).replace(/\n/g, '')}\n`;

        //cursor.y += settings.lineSpacing + (url ? 0.5 : -0.5);
        cursor.y += settings.lineSpacing - 0.5;

        printParagraph(doc, text, {
          font: 'fontRegular',
          x: settings.marginX + 3,
          size: settings.bodySize - 1,
          lineSpacing: settings.lineSpacing - 0.5,
        });

        cursor.y += settings.lineSpacing - 1.5;

        li.querySelectorAll('li').forEach((li) => {
          const text = `${unescapeHtml(li.innerHTML).replace(/\n/g, '')}\n`;
          const ret = printLi(doc, text, {
            x: settings.marginX + 3,
            size: settings.bodySize - 1,
            lineSpacing: settings.lineSpacing - 0.5,
          });
          cursor.y = ret.y - settings.lineSpacing + 2;
        });
      }

      if (idx < elems.length - 1) cursor.y += settings.lineSpacing + 2;
    });
};

/*-----------------------------------------------------------------------------*/

sections.skills = (doc, lang) => {
  const text = unescapeHtml(
    document.querySelector(
      `#titleSkills${lang.charAt(0).toUpperCase()}${lang.slice(1)}`,
    ).innerHTML,
  );

  printHeading(doc, text);

  const skillsSet = new Set();

  document
    .querySelectorAll(
      `section[data-sezione='cv'][lang='${lang}'] [type='checkbox'][data-rel='skills']:checked`,
    )
    .forEach((chk) => {
      document
        .querySelectorAll(
          `section[data-sezione="skills"][lang="${lang}"] > article > ul[data-rel="${chk.value}"] > li span[data-rel='cv']`,
        )
        .forEach((li) => {
          const skill = `${unescapeHtml(li.innerHTML).replace(/\n/g, '')}`;
          skillsSet.add(skill);
        });
    });

  const skills = Array.from(skillsSet).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  ); //case UN-sensitive

  cursor.y += settings.lineSpacing + 1;

  for (const skill of skills) {
    checkForBreak(doc, true);

    print(doc, skill, {
      border: true,
      size: settings.bodySize - 1,
      lineSpacing: settings.lineSpacing + 3,
      wordSpacing: settings.wordSpacing + 4,
    });
  }
  cursor.y += settings.lineSpacing * 5;
};

/*-----------------------------------------------------------------------------*/

sections.formazione = (doc, lang) => {
  checkForBreak(doc, true);

  const text = unescapeHtml(
    document.querySelector(
      `#titleFormazione${lang.charAt(0).toUpperCase()}${lang.slice(1)}`,
    ).innerHTML,
  );

  let startY = cursor.y;

  if (startY > doc.getPageHeight() - settings.marginY - settings.bodySize * 2) {
    doc.addPage();
    startY = settings.marginY;
    cursor.y = startY;
  }

  printHeading(doc, text);

  checkForBreak(doc, true);

  cursor.y += settings.lineSpacing + 1;

  startY = cursor.y;

  const sec = document.querySelector(
    `section[data-sezione='formazione'][lang='${lang}']`,
  );

  const university = sec.querySelector('p > span').innerText;
  const link = sec.querySelector('p > a');

  const retLi = printLi(doc, link.innerText, {
    url: link.getAttribute('href'),
    font: 'fontSemiBold',
    force: true,
    underline: true,
  });

  const dimsLi = doc.getTextDimensions(link.innerText);

  const retUn = println(doc, university, {
    font: 'fontItalic',
    force: true,
    y: startY + dimsLi.h + 3,
    x: settings.marginX + 3,
  });

  const date = sec.querySelector('p > b').innerText;
  const textDate = `${unescapeHtml(date).replace(/\n/g, '')}`;
  const retDate = print(doc, textDate, {
    y: startY - 1,
    align: 'right',
    force: true,
    font: 'fontItalic',
    size: settings.bodySize - 1.5,
    color: settings.accentColor,
  });

  println(doc, 'a', {
    font: 'fontGlyphs',
    force: true,
    color: settings.accentColor,
    size: settings.bodySize - 1.3,
    x: retDate.x - 5,
    y: startY - 1,
  });

  cursor.y += 12;

  const includiOnline = document.querySelector(
    `section[data-sezione='cv'][lang='${lang}'] [type='checkbox'][value='online']:checked`,
  );
  const includiInPresenza = document.querySelector(
    `section[data-sezione='cv'][lang='${lang}'] [type='checkbox'][value='inpresenza']:checked`,
  );

  if (!includiOnline && !includiInPresenza) return true;

  const retHeader = println(
    doc,
    lang === 'en' ? 'Last completed courses' : 'Ultimi corsi completati',
    {
      x: settings.marginX + 3,
      font: 'fontSemiBold',
      color: settings.accentColor,
      size: settings.headingSize - 2,
    },
  );

  const ret1 = println(
    doc,
    lang === 'en' ? '( complete list:' : '( elenco completo:',
    {
      x: retHeader.x + settings.wordSpacing + retHeader.w,
      y: retHeader.y - 0.2,
      font: 'fontItalic',
      size: settings.bodySize - 2,
      color: settings.accentColor,
    },
  );

  const ret2 = println(doc, `https://${settings.site}/#formazione`, {
    x: ret1.x + settings.wordSpacing + ret1.w,
    y: retHeader.y - 0.2,
    font: 'fontItalic',
    size: settings.bodySize - 2,
    underline: true,
    color: settings.accentColor,
    url: `https://${settings.site}/#formazione`,
  });

  const ret3 = println(doc, ')', {
    x: ret2.x + +settings.wordSpacing + ret2.w,
    y: retHeader.y - 0.2,
    font: 'fontItalic',
    size: settings.bodySize - 2,
    color: settings.accentColor,
  });

  cursor.y += 3;

  const maxOnline = document.querySelector(
    `section[data-sezione='cv'][lang='${lang}'] [type='number'][data-rel='online']`,
  ).value;
  const maxInPresenza = document.querySelector(
    `section[data-sezione='cv'][lang='${lang}'] [type='number'][data-rel='inpresenza']`,
  ).value;

  let nrOnline = 1;
  let nrInPresenza = 1;

  const filter =
    includiOnline && includiInPresenza
      ? ''
      : includiOnline
        ? '[data-online=true]'
        : '[data-online=false]';

  const corsi = document
    .querySelectorAll(
      `section[data-sezione="formazione"][lang="${lang}"] > article  li.corsi li${filter}`,
    )
    .forEach((li) => {
      const h = li.querySelector('h5');
      const a = h.querySelector('a');

      const details = h.closest('details');
      const year = details.querySelector('b').innerText;
      const textYear = `${unescapeHtml(year).replace(/\n/g, '')}`;
      const relatori = li.querySelector('p.relatori');
      const piattaforme = li.querySelector('p.piattaforme');
      const certificati = li.querySelector('p.certificati');

      const aCert = certificati ? certificati.querySelector('a') : null;

      let textRelatori;

      if (li.dataset.online === 'true') {
        if (nrOnline > maxOnline) return;
        nrOnline += 1;
      } else {
        if (nrInPresenza > maxInPresenza) return;
        nrInPresenza += 1;
      }

      if (relatori || piattaforme) details.toggleAttribute('open', true);

      if (relatori) textRelatori = relatori.innerText;
      if (piattaforme)
        textRelatori +=
          (relatori ? ' (' : '') +
          piattaforme.innerText +
          (relatori ? ')' : '');

      const title = a ? a.innerHTML : h.innerHTML;
      const url = aCert ? aCert.getAttribute('href') : a?.getAttribute('href');

      checkForBreak(doc, true);

      const retLi = printLi(doc, unescapeHtml(title).trim(), {
        url: url,
        font: 'fontSemiBold',
        underline: !!a,
      });

      const retYear = print(doc, textYear, {
        y: retLi.y - 1,
        align: 'right',
        force: true,
        font: 'fontItalic',
        size: settings.bodySize - 1.5,
        color: settings.accentColor,
      });

      println(doc, 'a', {
        font: 'fontGlyphs',
        force: true,
        color: settings.accentColor,
        size: settings.bodySize - 1.3,
        x: retYear.x - 5,
        y: retLi.y - 1,
      });

      cursor.y += settings.lineSpacing + 1;

      /* if (textRelatori) {
        const dimsTitle = doc.getTextDimensions(title);

        const retRel = println(doc, textRelatori, {
          font: 'fontItalic',
          force: true,
          y: retLi.y + dimsTitle.h + (a ? 3 : 2),
          x: settings.marginX + 3,
        });

        checkForBreak(doc, true);

        cursor.y += settings.lineSpacing;
      }*/
    });

  cursor.y += settings.lineSpacing * 1.5;
};

/*-----------------------------------------------------------------------------*/

sections.associazioni = (doc, lang) => {
  const text = unescapeHtml(
    document.querySelector(
      `#titleAssociazioni${lang.charAt(0).toUpperCase()}${lang.slice(1)}`,
    ).innerHTML,
  );

  let startY = cursor.y;

  if (startY > doc.getPageHeight() - settings.marginY - settings.bodySize * 2) {
    doc.addPage();
    startY = settings.marginY;
    cursor.y = startY;
  }

  printHeading(doc, text);

  cursor.y += settings.lineSpacing + 1;

  startY = cursor.y;

  const associazioni = document
    .querySelectorAll(
      `section[data-sezione="associazioni"][lang="${lang}"] > article  > ul li`,
    )
    .forEach((li) => {
      const h = li.querySelector('h4');
      const a = h.querySelector('a');
      const year = li.querySelector('.data').innerText;
      const textYear = `${unescapeHtml(year).replace(/\n/g, '')}`;
      const descrizione = li.querySelector('.descrizione')?.innerText;

      const title = a ? a.innerHTML : h.innerHTML;
      const url = a?.getAttribute('href');

      checkForBreak(doc, true);

      const retLi = printLi(doc, unescapeHtml(title).trim(), {
        url: url,
        font: 'fontSemiBold',
        underline: !!a,
      });

      const retYear = print(doc, textYear, {
        y: retLi.y - 1,
        align: 'right',
        force: true,
        font: 'fontItalic',
        size: settings.bodySize - 1.5,
        color: settings.accentColor,
      });

      println(doc, 'a', {
        font: 'fontGlyphs',
        force: true,
        color: settings.accentColor,
        size: settings.bodySize - 1.3,
        x: retYear.x - 5,
        y: retLi.y - 1,
      });

      cursor.y += settings.lineSpacing + 1;

      if (descrizione) {
        const dimsTitle = doc.getTextDimensions(title);

        const retDesc = printParagraph(doc, descrizione, {
          font: 'fontItalic',
          force: true,
          y: retLi.y + dimsTitle.h + (a ? 3 : 2),
          x: settings.marginX + 3,
        });

        checkForBreak(doc, true);

        cursor.y += settings.lineSpacing + 3;
      }
    });

  cursor.y += settings.lineSpacing * 1.5;
};

/*-----------------------------------------------------------------------------*/

sections.pubblicazioni = (doc, lang) => {
  const text = unescapeHtml(
    document.querySelector(
      `#titlePubblicazioni${lang.charAt(0).toUpperCase()}${lang.slice(1)}`,
    ).innerHTML,
  );

  let startY = cursor.y;

  if (startY > doc.getPageHeight() - settings.marginY - settings.bodySize * 3) {
    doc.addPage();
    startY = settings.marginY;
    cursor.y = startY;
  }

  printHeading(doc, text);

  cursor.y += settings.lineSpacing + 1;

  startY = cursor.y;

  const pubblicazioni = document
    .querySelectorAll(
      `section[data-sezione="pubblicazioni"][lang="${lang}"] > article  > ul li`,
    )
    .forEach((li) => {
      const h = li.querySelector('h4');
      const a = h.querySelector('a');
      const year = li.querySelector('.data').innerText;
      const textYear = `${unescapeHtml(year).replace(/\n/g, '')}`;
      const descrizione = li.querySelector('.descrizione')?.innerText;

      const title = a ? a.innerHTML : h.innerHTML;
      const url = a?.getAttribute('href');

      checkForBreak(doc, true);

      const retLi = printLi(doc, unescapeHtml(title).trim(), {
        url: url,
        font: 'fontSemiBold',
        underline: !!a,
      });

      const retYear = print(doc, textYear, {
        y: retLi.y - 1,
        align: 'right',
        force: true,
        font: 'fontItalic',
        size: settings.bodySize - 1.5,
        color: settings.accentColor,
      });

      println(doc, 'a', {
        font: 'fontGlyphs',
        force: true,
        color: settings.accentColor,
        size: settings.bodySize - 1.3,
        x: retYear.x - 5,
        y: retLi.y - 1,
      });

      cursor.y += settings.lineSpacing + 1;

      if (descrizione) {
        const dimsTitle = doc.getTextDimensions(title);

        const retDesc = printParagraph(doc, descrizione, {
          font: 'fontItalic',
          force: true,
          y: retLi.y + dimsTitle.h + (a ? 3 : 2),
          x: settings.marginX + 3,
        });

        checkForBreak(doc, true);

        cursor.y += settings.lineSpacing + 3;
      }
    });
};

/*-----------------------------------------------------------------------------*/

sections.lingue = (doc, lang) => {
  let text = lang === 'en' ? 'Languages' : 'Lingue';

  let startY = cursor.y;

  if (startY > doc.getPageHeight() - settings.marginY - settings.bodySize * 2) {
    doc.addPage();
    startY = settings.marginY;
    cursor.y = startY;
  }

  printHeading(doc, text);

  cursor.y += settings.lineSpacing + 1;

  startY = cursor.y;

  text = lang === 'en' ? 'Italian' : 'Italiano';

  const retIt = printLi(doc, text);

  print(doc, lang === 'en' ? '( native )' : '( madrelingua )', {
    x: retIt.x + 14,
    y: startY - 0.2,
    font: 'fontItalic',
    size: settings.bodySize - 2,
    force: true,
  });

  cursor.y += settings.lineSpacing + 5;

  startY = cursor.y;

  text = lang === 'en' ? 'English' : 'Inglese';

  const retEn = printLi(doc, text);

  println(
    doc,
    lang === 'en'
      ? '( reading : C1 - writing, speaking, listening : B2 )'
      : '( lettura : C1 - scrittura, parlato, ascolto : B2 )',
    {
      x: retEn.x + 14,
      y: startY - 0.2,
      font: 'fontItalic',
      size: settings.bodySize - 2,
      force: true,
    },
  );
};

/*-----------------------------------------------------------------------------*/
