import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
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

  triggerJavaScriptError() {
    this.errorService.captureError(new Error('Hardcoded JavaScript error for Sentry Capacitor testing'));
  }

  async triggerNativeError() {
     let photo: Photo;

    try {
      // We've modified `Camera.getPhoto()` via `patch-package` to throw a hardcoded error.
      photo = await Camera.getPhoto({ resultType: CameraResultType.Uri, source: CameraSource.Camera });
    } catch (error) {
      // Don't send an error from the Web layer to Sentry in this case;
      // we are trying to focus on an error from the native layer.
      return;
    }
  }

  disableErrorService() {
    this.errorService.disable();
  }

  enableErrorService() {
    this.errorService.enable();
  }
}
