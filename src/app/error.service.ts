import { Injectable } from '@angular/core';
import { addBreadcrumb, Breadcrumb, captureException, getCurrentHub, init } from '@sentry/capacitor';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor() { }

  initialize() {
    init({
      dsn: '', // TODO: Replace with the desired DSN.
      release: '22.0.1', // TODO: This can be changed as needed.
      maxBreadcrumbs: 1, // Use 1 breadcrumb so it's easier to debug.
      autoSessionTracking: false, // Don't bother with session tracking.
      debug: true, // Enable debug logging to better understand what's going on with this issue.
      // enabled: true, // Default value is `true`.
      // enableNative: true, // Default value is `true`.
      // enableNativeCrashHandling: true, // Default value is `true`.
    });
  }

  addBreadcrumb(breadcrumb: Breadcrumb) {
    addBreadcrumb(breadcrumb);
  }

  captureError(error: any) {
    captureException(error);
  }

  disable() {
    // Stop sending events to Sentry.
    // For more info see: https://github.com/getsentry/sentry-javascript/issues/2039#issuecomment-486674574
    getCurrentHub().getClient().getOptions().enabled = false;

    // Attempt to stop native events as well.
    // Casting `Options` as `any` due to the typings not including the additional Capacitor SDK options.
    // The options are present at runtime if you inspect them.
    (getCurrentHub().getClient().getOptions() as any).enableNative = false;
    (getCurrentHub().getClient().getOptions() as any).enableNativeCrashHandling = false;
  }

  enable() {
    this.initialize();
  }
}
