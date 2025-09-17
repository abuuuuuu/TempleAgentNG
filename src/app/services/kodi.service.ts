import { Injectable } from '@angular/core';
import { Http } from '@capacitor-community/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KodiService {

  private propertiesmovies = ["playlistid","speed","position","totaltime","time","percentage","shuffled","repeat","canrepeat","canshuffle","canseek","partymode"];
  private propertiesaudio = ["playlistid","speed","position","totaltime","time","percentage"];

  public apiUrl = environment.production
    ? 'https://192.168.1.100/jsonrpc' // Producción (APK)
    : '/kodi/jsonrpc';                    // Desarrollo (proxy)

  constructor() {
    console.log('Inici');
  }

  async sendMessage(payload: any): Promise<any> {
    return;
    console.log('Payload enviado:', JSON.stringify(payload, null, 2));
    try {
      // Realiza la solicitud POST usando el plugin HTTP de Capacitor
      const response = await Http.post({
        url: this.apiUrl,
        headers: {
          'Content-Type': 'application/json'
        },
        data: payload
      });

      // Verificar el estado de la respuesta
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Retornar los datos de la respuesta
      return response.data;
    } catch (error) {
      console.error('Error en llamada HTTP (HTTP plugin):', error);
      throw error;
    }
  }

}
