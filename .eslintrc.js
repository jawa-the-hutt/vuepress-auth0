module.exports = {
  // https://eslint.org/docs/user-guide/configuring#using-configuration-files-1
  root: true,

  // https://eslint.org/docs/user-guide/configuring#specifying-environments
  env: {
    browser: true,
    node: true,
    es6: true
  },

	parser: 'babel-eslint',
	parserOptions: {
		parser: '@typescript-eslint/parser',
		ecmaVersion: 2017,
		sourceType: 'module',
		project: './tsconfig.json'
	},

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint'
  ],


	// https://eslint.org/docs/user-guide/configuring#configuring-plugins
	plugins: ['@typescript-eslint'],

	"rules": {
		"import/extensions": 0,
		"global-require": 0,
		"eol-last": 0,
		"no-param-reassign": 0,
		"object-curly-newline": 0,
		"no-plusplus": 0,
		"no-console": "off",
		"no-implicity-any": "off",
		"no-explicity-any": "off",
		"max-len": [
			2,
			{
				"code": 160
			}
		],
		"prefer-destructuring": [
			2,
			{
				"object": true,
				"array": false
			}
		],
		"@typescript-eslint/no-empty-interface": 1,
    // https://github.com/typescript-eslint/typescript-eslint/issues/103
    "@typescript-eslint/no-parameter-properties": 0
	},

}
