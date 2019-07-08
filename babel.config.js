module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        "targets": {
          "browsers": "last 2 versions, ie11",
          "node": true
        },
        "modules": false
      },
      // "@babel/preset-es2015",
      // "env", {"modules": false}
    ]
  ],
  'plugins': [
    // '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-modules-commonjs'
  ],
  retainLines: true,
  comments: true
};
