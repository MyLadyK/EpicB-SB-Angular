import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DemoModeService {
  private _demoMode = false;

  get demoMode(): boolean {
    // Always return false to ensure real data is used
    return false;
  }

  setDemoMode(value: boolean) {
    // Ignore any attempts to set demo mode to true
    this._demoMode = false;
  }
}
