module.exports = {
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_module/'],
  moduleDirectories: ['node_modules', 'src', '.jest'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js(x)?'],
  setupFilesAfterEnv: ['<rootDir>/.jest/setup.js'],
  moduleFileExtensions: ['js', 'jsx'],
};
