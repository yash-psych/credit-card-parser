const globals = require('globals');
const pluginJs = require('@eslint/js');
const pluginReactHooks = require('eslint-plugin-react-hooks');
const pluginReactRefresh = require('eslint-plugin-react-refresh');

module.exports = [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    plugins: {
      'react-hooks': pluginReactHooks,
      'react-refresh': pluginReactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': 'warn',
      ...pluginReactHooks.configs.recommended.rules
    }
  }
];