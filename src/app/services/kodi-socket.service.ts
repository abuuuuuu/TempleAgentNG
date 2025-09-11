import { Injectable } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { KodiService } from './kodi.service';

interface RequestKODI { 
  jsonrpc: string; 
  method: string; 
  id: number; 
  params: any;
}

@Injectable({
  providedIn: 'root'
})

export class KodiSocketService {
//  @Output() onConnected: EventEmitter<{result:boolean}> = new EventEmitter();
  private onConnectedSubject = new Subject<{ result: boolean }>();
  onConnected$ = this.onConnectedSubject.asObservable();

  private socket: WebSocket | null = null;
  private messagesSubject$ = new Subject<any>();
  private reconnectAttempts = 0;
  private numidrequestkodi = 0;
  public url ='ws://192.168.1.100:9080/jsonrpc';

  
  constructor(private dataService: KodiService) {
  }

  
  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return; // Ya conectado
    }

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('[KodiSocket] Conectado al WebSocket');
      this.reconnectAttempts = 0;
      this.onConnectedSubject.next({ result: true });
      console.log('Emès event onConnected');
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.messagesSubject$.next(data);
      } catch (e) {
        console.error('[KodiSocket] Error parseando mensaje:', e);
      }
    };

    this.socket.onerror = (error) => {
      console.error('[KodiSocket] Error de WebSocket:', error);
    };

    this.socket.onclose = (event) => {
      this.onConnectedSubject.next({ result: false });
      console.warn('[KodiSocket] Conexión cerrada', event);
      this.socket = null;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        console.log(`[KodiSocket] Reintentando conexión en ${delay}ms...`);
        timer(delay).subscribe(() => {
          this.reconnectAttempts++;
          this.connect();
        });
    };
  }

  private pGetRequestKodi(method: string, params: any): RequestKODI {
    const requestkodi: RequestKODI = {
      jsonrpc: "2.0",
      method: method,
      id: this.numidrequestkodi,
      params: params
    };
    console.log('Request KODI 2:', requestkodi);
    this.numidrequestkodi = this.numidrequestkodi + 1;
    return requestkodi;
  }
  private pGetRequestKodiString(method: string, params: any): string {
    return JSON.stringify(this.pGetRequestKodi(method, params));
  }

  private pHasSocketOpen(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  private pSendMessage(method: string,message: any) {
    if (this.socket && this.pHasSocketOpen()) {
      this.socket.send(this.pGetRequestKodiString(method,message));
    } else {
      console.error('[KodiSocket] No se puede enviar el mensaje, WebSocket no está conectado');
    }
  }

  sendMessage(method: string,message: any, callback?: (response: any) => void) {
    if (((method.length>7 && method.substring(0,6)=='Input.') ||
        (!(callback && typeof callback=='function'))) && 
      this.pHasSocketOpen()) {
      //
      this.pSendMessage(method,message);
      return;
    }
    this.dataService.sendMessage(this.pGetRequestKodi(method,message)).subscribe(
      (response) => { 
        if (callback) { callback(response); }
      },
      (error) => { console.error('[KodiSocket] Error en la petición HTTP:', error); }
    );
  }
  
  getMessages(): Observable<any> {
    return this.messagesSubject$.asObservable();
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
