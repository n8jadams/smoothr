const rollupConfig = require('kcd-scripts/config').getRollupConfig();

Object.assign(rollupConfig, {
  external: [
    'react',
    'preact',
    'preact-context',
    'prop-types',
    'path-to-regexp'
  ],
  output: [
    Object.assign(rollupConfig.output[0], {
      globals: {
        react: 'React',
        preact: 'preact',
        'preact-context': 'preact-context',
        'prop-types': 'PropTypes',
        'path-to-regexp': 'pathToRegexp'
      },
      exports: 'named'
    })
  ]
});

module.exports = rollupConfig;
