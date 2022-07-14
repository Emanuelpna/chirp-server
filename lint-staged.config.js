module.exports = {
  '**/*.(ts|tsx|js|jsx)': () => [`npm run lint`, `npm run test`],
};
