export default {
  displayName: 'frontend',
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  coverageDirectory: '../../coverage/apps/frontend',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  moduleNameMapper: {
    '^@anime-gamify/shared-types$': '<rootDir>/../../libs/shared-types/src/index.ts',
    '^@anime-gamify/shared-constants$': '<rootDir>/../../libs/shared-constants/src/index.ts',
  },
  transform: {
    '^.+\\.(ts|mjs|js|html|svg)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
};
