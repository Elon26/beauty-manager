module.exports = {
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'es5',
  plugins: [
    require.resolve('prettier-plugin-tailwindcss'),
    require.resolve('@prettier/plugin-xml'),
  ],
  tailwindAttributes: ['className'],
};
