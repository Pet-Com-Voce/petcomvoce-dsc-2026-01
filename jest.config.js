module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  projects: [
    // ─── Unit tests ───────────────────────────────────────────────────────────
    {
      displayName: 'unit',
      rootDir: 'src',
      testRegex: '.*\\.spec\\.ts$',
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      collectCoverageFrom: ['**/*.(t|j)s'],
      coverageDirectory: '../coverage/unit',
      testEnvironment: 'node',
    },
    // ─── E2E / Integration tests ──────────────────────────────────────────────
    {
      displayName: 'e2e',
      rootDir: 'test',
      testRegex: '.*\\.e2e-spec\\.ts$',
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      coverageDirectory: '../coverage/e2e',
      testEnvironment: 'node',
    },
  ],
};
