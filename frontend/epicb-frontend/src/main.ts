import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; // Importar HttpClientModule

// Fusiona los providers del appConfig con los necesarios en main.ts para asegurar que el interceptor JWT esté activo
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []), // Añade los providers del appConfig (incluyendo el interceptor)
    importProvidersFrom(HttpClientModule),
    provideRouter(routes)
  ]
}).catch(err => console.error(err));
