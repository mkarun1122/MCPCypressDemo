const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: false,
  screenshotOnRunFailure: true,
  screenshotsFolder: "cypress/screenshots",
  video: false,
  e2e: {
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
