import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DMXService {

private apiUrl = environment.production
  ? 'http://192.168.1.100:9090/set_dmx' // Producción (APK)
  :  '/dmx/set_dmx';                    // Desarrollo (proxy)

  constructor(private http: HttpClient) {
     console.log('Inici DMX');
  }


SetDMX(payload: string) {
  
  const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' });
  console.log('DMX Service',this.apiUrl+'?',payload);
  return this.http.post(this.apiUrl, payload, { 
  headers: headers, 
  responseType: 'text'  // Esperamos una respuesta de tipo texto
   })
    .subscribe(
      (response) => {
        // Aquí manejas la respuesta
        console.log('Respuesta recibida:', response);
      },
      (error) => {
        // Aquí manejas cualquier error
        console.error('Error en la petición:', error);
      }
    );
}
}
