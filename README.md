# sentry-capacitor-enable-sdk-issue

## Overview

This repo is a reproduction sample app for what appears to be an issue in [Sentry Capacitor](https://github.com/getsentry/sentry-capacitor).

The sample app uses the following libraries at these approximate versions
- Sentry Capacitor - `0.4.3`
- Capacitor - `3.4.1`
- Angular - `13.0.0`
- Ionic Angular - `6.0.0`

The app uses the Ionic Angular "blank" starter app.

## Setup
- Set up your dev environment for Capacitor development by following the official docs [here](https://capacitorjs.com/docs/getting-started/environment-setup).
- From the terminal in the root of the repo, run the following commands
  - `npm install`
  - `npm run cap.prep`

## Running the App

You can use either Capacitor's Live Reload feature or manually build the app (front-end and native) and deploy the native app again. Changes to the native layer will require a subsequent native app build and deployment.

### Live Reload
- Reference: https://capacitorjs.com/docs/guides/live-reload
- Works like an `ionic serve` in which the WebView is reloaded after updating TypeScript, HTML, CSS, etc. It prompts for the device/emulator you'd like to deploy to, runs a `cap sync`, starts an `ionic serve`, builds the native app, and deploys the native app to the device/emulator.

- Run the command
  - `cap.run.ios` or `cap.run.android`
    - This command is comprised of
      - `npx ionic cap run <platform> --livereload --external`
        - Using the `--external` option
          - Uses a server URL for the WebView that is _not_ `localhost` but rather loads `ionic serve` content remotely from your desktop computer using the computer's IP address.
          - Allows JavaScript source mapping to work when debugging the Android WebView.
          - Required for device use but not necessarily for emulators which can successfully load content from the desktop computer using `localhost`. However, without providing this option you will not get JavaScript source mapping when debugging the Android WebView on an emulator.
          - Allows for livereloads to occur without a USB connection.
          - Some privileged Web APIs (for example, Geolocation) that only work when using SSL or `localhost` may not work with the app hosted at an IP address. Self-signed certificates [do not appear](https://github.com/ionic-team/capacitor/issues/3707#issuecomment-712997461) to be an option.
- Your computer and device _must_ be on the same WiFi network. VPNs could potentially cause problems.
  - There may be multiple network interfaces detected so at the prompt choose the one which is your local IP address. See [here](https://capacitorjs.com/docs/guides/live-reload#using-with-framework-clis) for help finding your IP.
- Devices may need to be connected via USB for the native build deployment but can thereafter get livereload updates of the front-end build without needing a wired connection.
  - The device will continue to get livereload updates even after restarting the dev server when using a previous native deployment so long as you continue serving on the same IP. This means that you can have an Android and iOS device both running the same build and get the same updates although they must have been built in succession with a closing of the command before moving onto the other.
- When the deployment is finished, `capacitor.config.json`, `AndroidManifest.xml`, and `AndroidManifest.xml.orig` may appear as pending changes in source control. They contain temporary configuration changes necessary to facilitate livereload. They should be automatically removed from pending changes upon `Ctrl + C` of the process but manual removal may occasionally be necessary if the clean-up step fails.

### Manual Build and Deploy
- To build the front-end and copy the files to the native app, run
  - `npm run cap.build`
- Open the native IDE (if it's not already open) with
  - `npx cap open ios` or `npx cap open android`
- Use the native IDE to build and deploy the native app.


## Steps to Reproduce

- Open `/src/app/error.service.ts` and for the `dsn` value specify the Sentry DSN you'd like to use.

- Scenario 1 - `enabled` and `enableNative` flags at initialization do not stop Android native errors
  - In `/src/app/error.service.ts`, in the Sentry `init()` function, set:
    ```typescript
      enabled: false, // Default value is `true`.
      enableNative: false, // Default value is `true`.
    ```
  - Get the app running by following [Running the App](#running-the-app).
  - Once the app is running, click the button that says `Trigger JavaScript Error`.
    - The click event will be handled in `/src/app/home/home.page.ts`. If you wait for a minute or so the event should not appear in Sentry. The name of the error would be `Hardcoded JavaScript error for Sentry Capacitor testing`.
    - The JavaScript error not being sent to Sentry is expected. Just setting `enabled: false` is enough to do that.
  - Now click the button that says `Trigger Native Error`.
    - The click event will be handled in `/src/app/home/home.page.ts`. The Capacitor Camera plugin has been modified via `patch-package` to throw a native error and crash the app.
    - Re-open the app so the native error has a chance to be sent to Sentry.
    - On Android,
      - If you wait for a minute or so the event should appear in Sentry. The name of the error will be `Hardcoded JavaScript error for Sentry Capacitor testing`.
      - The native error being sent to Sentry is not expected. Expected `enabled: false` to prevent that from happening as it seems like a blanket setting to enable/disable the entire SDK.
        - Also, even `enableNative: false` is not enough to prevent the native error from being sent.
        - The combination of `enabled: false` and a *different* flag, `enableNativeCrashHandling: false`, *will* prevent the native error from being sent to Sentry. However, expected `enabled: false` (and perhaps even `enableNative: false`) to be sufficient.
    - On iOS,
      - If you wait for a minute or so the event should not appear in Sentry. The name of the error would be `Hardcoded JavaScript error for Sentry Capacitor testing`.
      - The native error not being sent to Sentry is expected. Just setting `enabled: false` is enough to do that.
- Scenario 2 - Disabling the SDK at runtime does not stop Android and iOS native errors
  - If there are pending changes from following the steps in Scenario 1, undo those changes first. Given the default values, the following values will effectively be used:
    ```typescript
      enabled: true, // Default value is `true`.
      enableNative: true, // Default value is `true`.
      enableNativeCrashHandling: true, // Default value is `true`.
    ```
  - Get the app running by following [Running the App](#running-the-app).
  - Once the app is running, click the button that says `Disable Error Service`.
    - This will attempt to disable the SDK by doing the following:
      ```typescript
      // Stop sending events to Sentry.
      // For more info see: https://github.com/getsentry/sentry-javascript/issues/2039#issuecomment-486674574
      getCurrentHub().getClient().getOptions().enabled = false;

      // Attempt to stop native events as well.
      // Casting `Options` as `any` due to the typings not including the additional Capacitor SDK options.
      // The options are present at runtime if you inspect them.
      (getCurrentHub().getClient().getOptions() as any).enableNative = false;
      (getCurrentHub().getClient().getOptions() as any).enableNativeCrashHandling = false;
      ```
  - Next click the button that says `Trigger JavaScript Error`.
    - The click event will be handled in `/src/app/home/home.page.ts`. If you wait for a minute or so the event should not appear in Sentry. The name of the error would be `Hardcoded JavaScript error for Sentry Capacitor testing`.
      - The JavaScript error not being sent to Sentry is expected. Just setting `getCurrentHub().getClient().getOptions().enabled = false` is enough to do that.
  - Now click the button that says `Trigger Native Error`.
    - The click event will be handled in `/src/app/home/home.page.ts`. The Capacitor Camera plugin has been modified via `patch-package` to throw a native error and crash the app.
    - Re-open the app so the native error has a chance to be sent to Sentry.
    - On Android or iOS,
      - If you wait for a minute or so the event should appear in Sentry. The name of the error will be `Hardcoded JavaScript error for Sentry Capacitor testing`.
      - The native error being sent to Sentry is not expected. Expected `getCurrentHub().getClient().getOptions().enabled = false` to prevent that from happening as it seems like a blanket setting to enable/disable the entire SDK. Using that API for the JavaScript SDK was recommended in https://github.com/getsentry/sentry-javascript/issues/2039#issuecomment-486674574 .
        - Also, even `(getCurrentHub().getClient().getOptions() as any).enableNative = false` and `(getCurrentHub().getClient().getOptions() as any).enableNativeCrashHandling = false` are not enough to prevent the native error from being sent.
        - Expected `getCurrentHub().getClient().getOptions().enabled = false` (and perhaps even `(getCurrentHub().getClient().getOptions() as any).enableNative` with `(getCurrentHub().getClient().getOptions() as any).enableNativeCrashHandling`) to be sufficient.
  - Related notes about this scenario
    - You can re-enable the SDK by clicking the button that says `Enable Error Service` which will re-intialize the SDK. That seems to work as expected.
    - If we are to use `getCurrentHub().getClient().getOptions()` to disable the SDK at runtime, it would be nice if it had TypeScript typings that reflects the changes in the Capacitor SDK such as the additional native-related properties which do appear to be present at runtime.
