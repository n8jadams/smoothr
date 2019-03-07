function getLSArray(key) {
  let val = JSON.parse(localStorage.getItem(key));
  return !val ? [] : [...val].filter(k => k);
}

function pushLSArray(key, val, force = false) {
  let lsArray = getLSArray(key);
  if (typeof val === 'string' && (force || lsArray.indexOf(val) === -1)) {
    lsArray.push(val);
  }
  // Arbitrary max amount of keys
  if (lsArray.length >= 100) {
    lsArray = [];
  }
  localStorage.setItem(key, JSON.stringify(lsArray));
}

export { getLSArray, pushLSArray };
