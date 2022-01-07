module.exports = {
  transform: {
    '^.+\\.tsx?$': 'esbuild-jest',
  },
  globals: {},
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts'],
  watchPathIgnorePatterns: ['/node_modules/'],
  snapshotSerializers: ['miniprogram-simulate/jest-snapshot-plugin'],
}
