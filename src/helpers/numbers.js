/* global isNaN, isFinite */
/* eslint-disable no-restricted-globals */

// https://stackoverflow.com/a/27865285
function getPrecision(number) {
  if (!isFinite(number) || isNaN(number)) return 0;
  const value = +number;
  let e = 1;
  let p = 0;
  while (Math.round(value * e) / e !== value) {
    e *= 10;
    p += 1;
  }
  return p;
}

function truncate(value, precision) {
  if (isNaN(value)) return false;
  // Avoids losing decimal precision if param 'precision' is greater than value's precision. decimals than the
  // Example: value=0.00013 would return 0.00012999 if precision is 8.
  if (precision >= getPrecision(value)) {
    return value;
  }
  const multi = 10 ** precision;
  return Math.floor(value * multi) / multi;
}

export { getPrecision, truncate };
