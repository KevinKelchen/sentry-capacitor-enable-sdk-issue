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

  triggerError() {
    this.errorService.captureError(new Error('This error should result in unknown metadata'));
  }
}
