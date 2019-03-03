function getLSArray(key) {
  let val = JSON.parse(localStorage.getItem(key));
  return !val ? [] : [...val];
}

function pushLSArray(key, val, force = false) {
  let lsArray = getLSArray(key);
  if (force || lsArray.indexOf(val) === -1) {
    lsArray.push(val);
  }
  localStorage.setItem(key, JSON.stringify(lsArray));
}

export { getLSArray, pushLSArray };