import { defineConfig, devices } from '@playwright/test';
const localBase='http://127.0.0.1:3000';
const mountedPath='/national-tools/platte-crane-live';
export default defineConfig({
  testDir:'./e2e', timeout:30_000,
  use:{baseURL:process.env.PLAYWRIGHT_BASE_URL||localBase,trace:'retain-on-failure'},
  projects:[{name:'desktop',use:{...devices['Desktop Chrome']}},{name:'mobile-390',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}}],
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {command:'npm run dev',url:`${localBase}${mountedPath}`,reuseExistingServer:true,timeout:120_000}
});
