import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DemoModeService {
  private _demoMode = false;

  get demoMode(): boolean {
    return this._demoMode;
  }

  setDemoMode(value: boolean) {
    this._demoMode = value;
  }
}
