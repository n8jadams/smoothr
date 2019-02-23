import pathToRegexp from 'path-to-regexp';

function extractPathVars(pathWithVars, extractingPath) {
  let pathKeys = [];
  let pathAsRegexp = pathToRegexp(pathWithVars, pathKeys);
  const r = pathAsRegexp.exec(extractingPath);
  return pathKeys.reduce((acc, key, i) => ({ [key.name]: pathAsRegexp.exec(extractingPath)[i + 1], ...acc }), {});
}

export { extractPathVars };