const corsi = [
  '1998.min.json',
  '2004.min.json',
  '2005.min.json',
  '2008.min.json',
  '2013.min.json',
  '2016.min.json',
  '2018.min.json',
  '2020.min.json',
  '2022.min.json',
  '2023.min.json',
  '2024.min.json',
  '2025.min.json',
].map((el) => `/data/corsi/${el}`);

const eventi_codemotion = [
  'codemotion_gmail1_1.min.json',
  'codemotion_gmail1_2.min.json',
  'codemotion_gmail1_3.min.json',
].map((el) => `/data/eventi/codemotion/${el}`);

const eventi_eventbrite = [
  'eventbrite_gmail1.min.json',
  'eventbrite_gmail2.min.json',
].map((el) => `/data/eventi/eventbrite/${el}`);

const eventi_google = ['giuseppe.pizzimenti.seed@gmail.com.min.json'].map(
  (el) => `/data/eventi/google/${el}`,
);

const eventi = [
  '/data/eventi/esclusioni.min.js',
  'data/eventi/partecipante.min.json',
  'data/eventi/relatore.min.json',
  ...eventi_codemotion,
  ...eventi_eventbrite,
  ...eventi_google,
];


const images_screenshots = ['1.jpg','2.jpg','3.jpg','4.jpg'].map((el) => `/images/screenshots/${el}`);

const images_covers = ['1.webp'].map((el) => `/images/covers/${el}`);

const images_cursors = ['swipe-left.svg', 'swipe.svg', 'swipe-right.svg'].map(
  (el) => `/images/cursors/${el}`,
);

const images_favicon = [
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
  'apple-touch-icon.png',
  'favicon-16x16.png',
  'favicon-32x32.png',
].map((el) => `/images/favicon/${el}`);

const images_flags = ['gb.svg', 'it.svg'].map((el) => `/images/flags/${el}`);

const images_icons = [
  'draggable-vertical.svg',
  'draggable.svg',
  'menu.svg',
  'search.svg',
].map((el) => `/images/icons/${el}`);

const images_logos = ['st.svg', 'unime.svg'].map((el) => `/images/logos/${el}`);

const images_pics = ['1.webp', '2.webp', '3.webp', '4.webp'].map(
  (el) => `/images/pics/${el}`,
);

const images_social = [
  'anobii.svg',
  'codepen.svg',
  'email.svg',
  'facebook.svg',
  'gdevs.svg',
  'github.svg',
  'instagram.svg',
  'linkedin.svg',
  'mastodon.svg',
  'quora.svg',
  'slideshare.svg',
  'threads.svg',
  'bluesky.svg',
  'udemy.svg',
  'x.svg',
].map((el) => `/images/social/${el}`);

const images_tech = [
  'ant.svg',
  'aspnet.svg',
  'audacity.svg',
  'avidemux.svg',
  'backbone.svg',
  'bootstrap.svg',
  'c4.svg',
  'capcut.svg',
  'cordova.svg',
  'css3.svg',
  'css.svg',
  'delphi.svg',
  'eclipse.svg',
  'figma.svg',
  'foundation.svg',
  'gimp.svg',
  'git.svg',
  'github.svg',
  'gitlab.svg',
  'gmaps.svg',
  'gsap.svg',
  'hibernate.svg',
  'html5.svg',
  'idea.svg',
  'inkscape.svg',
  'java.svg',
  'javascript.svg',
  'jira.svg',
  'jquery-mobile.svg',
  'jquery-ui.svg',
  'jquery.svg',
  'jte.svg',
  'leaflet.svg',
  'lit.svg',
  'lodash.svg',
  'maven.svg',
  'net.svg',
  'netbeans.svg',
  'oracle.svg',
  'phonegap.svg',
  'postgres.svg',
  'pwa.svg',
  'redmine.svg',
  'sass.svg',
  'schemaorg.svg',
  'solr.svg',
  'spring-boot.svg',
  'spring.svg',
  'sqlite.svg',
  'sqlserver.svg',
  'subversion.svg',
  'thymeleaf.svg',
  'trello.svg',
  'vb6.svg',
  'vbnet.svg',
  'vs.svg',
  'vscode.svg',
  'webcomponents.svg',
  'webstorm.svg',
].map((el) => `/images/tech/${el}`);

const includes_ids = [
  'associazioni.inc.min.html',
  'chisono.inc.min.html',
  'contattami.inc.min.html',
  'cv.inc.min.html',
  'esperienza.inc.min.html',
  'eventi.inc.min.html',
  'formazione.inc.min.html',
  'profili.inc.min.html',
  'progetti.inc.min.html',
  'pubblicazioni.inc.min.html',
  'skills.inc.min.html',
];

const includes_en = includes_ids.map((el) => `/includes/en/${el}`);

const includes_it = includes_ids.map((el) => `/includes/it/${el}`);

const scripts_lib = [
  '/scripts/lib/dayjs/1.11.7/locale/en.js',
  '/scripts/lib/dayjs/1.11.7/locale/it.js',
  '/scripts/lib/dayjs/1.11.7/dayjs.min.js',
  '/scripts/lib/domPurify/3.0.6/dompurify.min.js',
  '/scripts/lib/icsUtils/iCalDateParser.min.js',
  '/scripts/lib/jsPDF/2.5.1/jspdf-2.5.1.umd.min.js',
  '/scripts/lib/markjs/9.0.0/mark.es6.min.js',
  '/scripts/lib/colors.min.js',
  '/scripts/lib/draggableList.min.js',
  '/scripts/lib/notifications.min.js',
  '/scripts/lib/scrollableList.min.js',
  '/scripts/lib/swiper.min.js',
  '/scripts/lib/utils.min.js',
];

const scripts_ids = [
  'contactForm.min.js',
  'cv.min.js',
  'data.worker.min.js',
  'main.min.js',
].map((el) => `/scripts/${el}`);

export const scripts = [...scripts_lib, ...scripts_ids];
export const styles = ['styles/css/style.min.css'];
export const fonts = [
  '/styles/fonts/cv/fonts.min.js',
  '/styles/fonts/Barlow/subsets/Bold/barlow-bold-subset.woff2',
  '/styles/fonts/Barlow/subsets/Regular/barlow-regular-subset.woff2',
  '/styles/fonts/Fontello/font/gpizzimenti-glyphs.woff2',
  '/styles/fonts/Kalam/subsets/Regular/kalam-regular-subset.woff2',
];
export const images = [
  ...images_covers,
  ...images_cursors,
  ...images_favicon,
  ...images_flags,
  ...images_icons,
  ...images_logos,
  ...images_pics,
  ...images_social,
  ...images_tech,
  ...images_screenshots,  
];
export const data = [...corsi, ...eventi];
export const includes = [...includes_en, ...includes_it];
