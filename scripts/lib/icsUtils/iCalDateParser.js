const T_INDEX = 8;
const Z_INDEX = 15;

/**
 * Parse a stringly typed iCal formatted date as a native JS date object
 * @param {string} date
 * @return {Date}
 */
export default function iCalDateParser(date) {
  if (!_validateFormat(date)) {
    throw new Error('Not a valid iCal date format');
  }

  const year = date.substring(0, 4);
  const month = parseInt(date.substring(4, 6), 10) - 1;
  const day = date.substring(6, 8);

  const hour = date.length > 8 ? date.substring(9, 11) : '00';
  const minute = date.length > 8 ? date.substring(11, 13) : '00';
  const second = date.length > 8 ? date.substring(13, 15) : '00';

  return new Date(Date.UTC(year, month, day, hour, minute, second));
}

/**
 * Check whether or not a given date is a valid iCal formatted date
 * @param {string} date
 * @return {boolean}
 * @private
 */
function _validateFormat(date) {
  const d = date.split('');

  if (d.length !== 16 && d.length !== 8 && d.length !== 15) return false;
  if (d.length === 16 && d[T_INDEX] !== 'T') return false;
  if (d.length === 16 && d[Z_INDEX] !== 'Z') return false;

  return d
    .filter((x, i) => i !== T_INDEX && i !== Z_INDEX)
    .every((x) => !Number.isNaN(parseInt(x)));
}
