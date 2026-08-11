/**
 * Development environment values.
 *
 * `angular.json` replaces `environment.ts` with this file for development
 * builds (`ng serve`, `ng build --configuration development`) via the
 * `fileReplacements` entry, so dev builds use local URLs/keys without touching
 * the production environment file.
 */
export const environment = {
  production: false,
  syncfusionLicenseKey:
    'YourSyncfusionLicenseKeyHere',
  /** Backend Web API base URL for local development. */
  webApiBaseUrl: 'https://localhost:59527'
};