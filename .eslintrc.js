module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'google'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    ecmaFeatures: {
      impliedStrict: true
    }
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    'require-jsdoc': 'off',
    'comma-dangle': 'off'
  },
};
