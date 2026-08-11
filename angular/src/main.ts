import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { initTheme } from './app/core/theme.service';
import { registerLicense, setCulture, setCurrencyCode } from '@syncfusion/ej2-base';

// Injected at build time by @ngx-env/builder from the NG_APP_SYNCFUSION_LICENCE_KEY
// environment variable (defined in `.env`, the shell, or the CI pipeline).
const syncfusionLicenseKey = process.env['NG_APP_SYNCFUSION_LICENCE_KEY'] ?? '';
registerLicense(syncfusionLicenseKey)

// Apply the persisted theme before Angular bootstraps, so the first paint
// matches the user's last selection (no light-flash for dark-mode users).
initTheme();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
