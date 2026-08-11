/**
 * Production environment values.
 *
 * `angular.json` swaps `environment.ts` with `environment.development.ts` for
 * development builds via a `fileReplacements` entry, so each build config gets
 * the right values without hardcoding them in `main.ts` or other source files.
 *
 * Use the production Syncfusion license key and the deployed Web API URL here.
 */
export const environment = {
  production: true,
  syncfusionLicenseKey:
    'YourSyncfusionLicenseKeyHere',
  /** Backend Web API base URL for production (deployed API). */
  webApiBaseUrl: 'https://localhost:59527'
};