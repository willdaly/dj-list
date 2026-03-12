/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: './test/smoke',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4100',
    headless: true
  },
  webServer: {
    command: 'NODE_ENV=test PORT=4100 DBNAME=dj-list npm start',
    url: 'http://127.0.0.1:4100',
    reuseExistingServer: true,
    timeout: 120000
  }
};
