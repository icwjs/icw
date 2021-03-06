const config = {
  setupTestFrameworkScriptFile: "./test/__hooks__/setupTestFramework.js",

  testMatch: ["<rootDir>/test/**/*.spec.js"],
  moduleFileExtensions: ["ts", "js"],

  transform: { "^.+\\.(ts|js)$": "ts-jest" },
  globals: { "ts-jest": { tsConfig: "tsconfig.test.json" } },

  testEnvironment: "node",
  testURL: "http://localhost",
  restoreMocks: true,

  collectCoverageFrom: ["<rootDir>/src/**"],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};

if (process.env.CI) {
  Object.assign(config, {
    verbose: true,
    collectCoverage: true
  });
}

module.exports = config;
