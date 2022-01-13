module.exports = {
  // transform: {
  //   '^.+\\.tsx?$': 'esbuild-jest',
  // },
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        sourceMaps: true,
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          transform: {
            optimizer: {
              globals: {
                vars: {
                  __TEST__: 'true',
                },
              },
            },
          },
          target: 'es2020',
          loose: false,
          externalHelpers: false,
        },
      },
    ],
  },
  globals: {},
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts'],
  watchPathIgnorePatterns: ['/node_modules/'],
  snapshotSerializers: ['miniprogram-simulate/jest-snapshot-plugin'],
}
