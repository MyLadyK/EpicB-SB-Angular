import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; // Importar HttpClientModule

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    importProvidersFrom(HttpClientModule), // Añadir HttpClientModule aquí
    provideRouter(routes) // Asegurarse de que las rutas están proporcionadas
  ]
}).catch(err => console.error(err));
