module.exports = {
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    url: "http://localhost/"
  },

  testMatch: ["**/__tests__/**/*.test.js"],

  collectCoverage: true,
  coverageProvider: "babel",
  collectCoverageFrom: [
    "products.js",
    "orders.js",
    "finances.js",
    "script.js",
    "help.js",
    "i18n.js",
    "cookie-banner.js"
  ],
  coverageReporters: ["text", "lcov", "html", "json-summary"],

  coverageThreshold: {
    global: {
      statements: 80,
      lines: 80,
      functions: 80
    }
  }
};
