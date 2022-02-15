import { Injectable } from '@angular/core';
import { addBreadcrumb, Breadcrumb, captureException, init } from '@sentry/capacitor';

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
    });
  }

  addBreadcrumb(breadcrumb: Breadcrumb) {
    addBreadcrumb(breadcrumb);
  }

  captureError(error: any) {
    captureException(error);
  }
}
