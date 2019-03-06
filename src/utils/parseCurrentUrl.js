// Takes the full url and parses out the currentUrl to be used in Smoothr state
function parseCurrentUrl({fullUrl, originPath}) {
  let fullUrlSuffix = fullUrl.split('/');
  fullUrlSuffix = `/${fullUrlSuffix.slice(3, fullUrlSuffix.length).join('/')}`;
  let currentUrl = fullUrlSuffix.split(originPath).join('') || '/';
  if(`${currentUrl}#` === originPath) {
    currentUrl = '/';
  }
  return currentUrl;
}

export { parseCurrentUrl };