
/**
 * Return an string based on the number given, if it has only one digit, it return with a zero first
 * @param {Number} toFormat
 * @returns {string}
 */
export function formatTwoDigitsNumberToString(toFormat: number): String {

  return toFormat.toString().padStart(2,'0');

}

