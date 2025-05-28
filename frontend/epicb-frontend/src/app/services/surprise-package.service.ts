import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SurprisePackage } from '../model/surprise-package';

@Injectable({
  providedIn: 'root'
})
export class SurprisePackageService {
  private apiUrl = environment.apiURL + '/packages';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene un paquete sorpresa aleatorio
   */
  getRandomPackage(): Observable<SurprisePackage> {
    return this.http.get<SurprisePackage>(`${this.apiUrl}/random`);
  }

  /**
   * Crea un nuevo paquete sorpresa
   */
  createPackage(surprisePackage: SurprisePackage): Observable<SurprisePackage> {
    return this.http.post<SurprisePackage>(`${this.apiUrl}`, surprisePackage);
  }

  /**
   * Obtiene todos los paquetes sorpresa
   */
  getAllPackages(): Observable<SurprisePackage[]> {
    return this.http.get<SurprisePackage[]>(`${this.apiUrl}`);
  }
} 