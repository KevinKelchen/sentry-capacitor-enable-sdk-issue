import { Component } from '@angular/core';
import { ErrorService } from './error.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private errorService: ErrorService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.errorService.initialize();
  }
}
