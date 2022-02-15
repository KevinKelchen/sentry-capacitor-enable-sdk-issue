import { Component } from '@angular/core';
import { ErrorService } from '../error.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private errorService: ErrorService,
  ) {}

  triggerErrorWithGoodBreadcrumb() {
    this.errorService.addBreadcrumb({
            category: 'xhr',
            data: {
              requestBody: '{ "foo": "bar" }',
              requestMethod: 'GET',
              requestURL: 'https://github.com/KevinKelchen/my-fake-request-breadcrumb-url',
            },
          });

    this.errorService.captureError(new Error('This error should include a good breadcrumb'));
  }

  triggerErrorWithBadBreadcrumb() {
    this.errorService.addBreadcrumb({
            category: 'xhr',
            data: {
              requestBody: '{ "foo": "© bar" }', // 'ü' is another example of a bad character.
              requestMethod: 'GET',
              requestURL: 'https://github.com/KevinKelchen/my-fake-request-breadcrumb-url',
            },
          });

    this.errorService.captureError(new Error('This error should include a bad breadcrumb'));
  }
}
