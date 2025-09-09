import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KodiService {

private propertiesmovies = ["playlistid","speed","position","totaltime","time","percentage","shuffled","repeat","canrepeat","canshuffle","canseek","partymode"];
private propertiesaudio = ["playlistid","speed","position","totaltime","time","percentage"];


private apiUrl = environment.production
  ? 'http://192.168.1.100:8080/jsonrpc' // Producción (APK)
  : '/kodi/jsonrpc';                    // Desarrollo (proxy)

  constructor(private http: HttpClient) {
     console.log('Inici');
  }


  sendMessage(payload: any) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
console.log('Payload enviado:', JSON.stringify(payload, null, 2));

    return this.http.post<any[]>(this.apiUrl, JSON.stringify(payload), { headers });
  }
}
