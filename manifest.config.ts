import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

export default defineManifest({
  manifest_version: 3,
  name: 'GE Parcel Compare',
  description:
    'Compare landed cost to Tbilisi via Camex, Inex, USA2Georgia and Kiwi Post directly on retailer product pages.',
  version: pkg.version,
  minimum_chrome_version: '116',
  default_locale: undefined,
  icons: {
    '16': 'icons/icon16.png',
    '48': 'icons/icon48.png',
    '128': 'icons/icon128.png',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      '16': 'icons/icon16.png',
      '48': 'icons/icon48.png',
    },
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['https://www.zara.com/*', 'https://zara.com/*'],
      js: ['src/content/index.tsx'],
      run_at: 'document_idle',
    },
  ],
  // Content-script chunks must stay importable in "any site" mode, where the
  // same loader is registered dynamically for <all_urls>.
  web_accessible_resources: [
    { resources: ['assets/*.js'], matches: ['<all_urls>'], use_dynamic_url: false },
  ],
  permissions: ['storage', 'alarms', 'scripting'],
  host_permissions: ['https://nbg.gov.ge/*', 'https://api.frankfurter.dev/*'],
  optional_host_permissions: ['<all_urls>'],
});
