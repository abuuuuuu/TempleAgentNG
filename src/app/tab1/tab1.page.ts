import { Component, OnInit,ElementRef, ViewChild, NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonButton, IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { KodiService } from '../services/kodi.service'; 
import { DMXService } from '../services/dmx.service'; 
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { KodiSocketService } from '../services/kodi-socket.service';
import { Subscription } from 'rxjs';
import { TouchCircleComponent } from '../touch-circle/touch-circle.component'; // Importa el componente
import { ExploreContainerComponent } from '../explore-container/explore-container.component'; // Ajusta el path si cal
import { StorageService } from '../services/storage.service';
import { RangeCustomEvent } from '@ionic/core';

//ionic serve --proxy-config proxy.conf.json
@Component({
  selector: 'app-tab1',
  standalone: true,
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  imports: [
    IonicModule, 
    ExploreContainerComponent,
    CommonModule, 
    FormsModule, 
    TouchCircleComponent // El componente ya está bien importado aquí
  ]
})

export class Tab1Page  implements OnInit {
  Data: any;
  directoryCurrent: string="/media/administrador/F410CE1810CDE22A/Casament Flacs/";
  directoryClick: string="";
  llistaFiles: any[] = [];
  resultado: any;
  eventos: any[] = [];
  private socketSub?: Subscription;
  socket!: WebSocket;
  ControlMusic: boolean=true;
  playlistIdMusic: number=0;
  playlistIdVideo: number=1;
  playlistIdPicture: number=2;
  numidrequestkodi: number=1;
  txtAlertMessage: string="";
  txtAlertTitle: string="";
  alertButtons: string[]=['D\'acord'];
  isAlertOpen: boolean=false;
  llistaCurrentMusic: any[] = [];
  isToastOpen: boolean = false;
  txtToastMessage: string = '';
  connectedSocket: boolean=false;
  segmentValue: string = 'first';
  redRange = { lower: 0, upper: 0 }; // placeholder inicial
  minValue = 0;
  maxValue = 255;
  musicplayed:any[]=[];
  musicfavorite:any[]=[];
  musiccuatemp:any[]=[];

  fabButtons = [
    { icon: '/svg/document.svg',
      action: () => this.TestFuncio()
    },
    { icon: '/svg/color-palette.svg',
      action: () => this.TestFuncio()
    }
  ];  

  @ViewChild('touchArea') touchArea!: ElementRef;
  touchPosition: { x: number, y: number } | null = null;

  constructor(private dataService: KodiService,private kodiSocket: KodiSocketService,private dmxService: DMXService,private storage: StorageService) {
    console.log('Tab1Page cargado');
  }

  TestFuncio() {
    console.log("TestFuncio");
  }

  ngOnInit() {
    this.kodiSocket.onConnected$.subscribe((event) => {
      this.onConnectedSocketReceived(event);
      console.log('Prova socket:' ,event);
      this.connectedSocket=event.result;
    });
    this.loadFromStorage('musicplayed', [], (data) => {
      this.musicplayed = data;
    });

    this.loadFromStorage('musicfavorite', [], (data) => {
      this.musicfavorite = data;
    });
    this.loadFromStorage('musiccuatemp', [], (data) => {
      this.musiccuatemp = data;
    });
    // Proves del servei d'emmagatzematge
    // this.storage.get('mi-json').then(datos => {
    //   console.log('Datos recuperados 1:', datos);
    // });
    // this.storage.set('mi-json', { clave: 'valor' }).then(() => {
    //   console.log('Datos guardados');
    // });
    // this.storage.remove('mi-json').then(() => {
    //   console.log('Datos eliminados');
    // });
      // this.storage.get('mi-json').then(datos => {
      //   console.log('Datos recuperados 2:', datos);
      // });
  //   const payload = [{
  // jsonrpc:"2.0",
  // method:"Files.GetDirectory",
  // id:"1",
  // params:{
  //   directory:this.directoryCurrent,
  //   media:"music",
  //   properties:["title","file","mimetype","thumbnail","dateadded","duration"],
  //   sort:{
  //     method:"none",
  //     order:"ascending"
  //     }
  //   }
  // }];

    // this.dataService.sendMessage(payload).subscribe(
    //   res => console.log('Resposta:' + res), //this.Data = res,
    //   err => console.error('Error en la petición:', err)
    // );
    // En tu componente
    // Carregar l'arrel de la música

    
  // this.dataService.sendMessage(payload).subscribe(response => {
  //     this.llistaFiles = response[0].result?.files || [];
  //   console.log('Respuesta:', JSON.stringify(response[0].result?.files));
  // },
  // error => {
  //   console.error('Error en la petición:', error);
  // });
    // Conexión al socket
  	console.log('Josep 1');
    this.kodiSocket.connect();
    let self = this;
    this.socketSub = this.kodiSocket.getMessages().subscribe((msg) => {
      console.log('[Tab1] Evento recibido:', msg);
      if (msg.method && msg.method.startsWith('Playlist.')) {
        console.log('Evento de Playlist recibido:', msg);
        if (msg.method === 'Playlist.OnAdd' || msg.method === 'Playlist.OnRemove' || msg.method === 'Playlist.OnClear') {
          // Si el evento afecta a la lista de reproducción actual, recargarla
          //if (msg.params.playlistid === self.playlistIdMusic) {
            self.LoadPlaylistMusicCurrent(msg.params?.data);
            if (msg.method === 'Playlist.OnClear') {
              self.setOpenToast(true, 'Llista buidada');
            }
            //self.pAddExtraDataLlistaFiles();
          //}
        }
        if (msg.method === 'Player.OnPlay') {
          if (msg.params.data && msg.params.data.item && msg.params.data.item.playlistid === self.playlistIdMusic) {
            let itemPos = self.llistaCurrentMusic[msg.params.data.item.position];
            itemPos.nomcurt = self.getNomCurt(itemPos.file,itemPos.titlecustom);
            this.musicplayed.push(itemPos);
            this.storage.set('musicplayed', this.musicplayed);
          }
        }
      }
      this.eventos.unshift(msg);
    });
  }
  ngOnDestroy() {
    this.socketSub?.unsubscribe();
    this.kodiSocket.disconnect();
//    this.dmxService.SetDMX('u=3&d=0,0');
  }
  ngAfterViewInit() {
    // Forzar asignación después de la carga completa de la vista
    setTimeout(() => {
      this.redRange = { lower: 100, upper: 150 };
    });
  }
  private loadFromStorage(key: string, defaultValue: any, callback: (data: any) => void): void {
    this.storage.get(key).then(datos => {
      if (datos) {
        callback(datos);
      } else {
        callback(defaultValue);
      }
    });
  }
  onIonRangeChange(event: RangeCustomEvent, color: string) {
    const value = event.detail.value;  
    if (color === 'red') {
      if (typeof value === 'object' && value !== null && 'lower' in value && 'upper' in value) {
        this.redRange = value as { lower: number; upper: number };
        console.log('ionChange red emitted value:', event);
        console.log('ionChange redRange emitted value:', this.redRange);
      }
    }// const range = event.target as HTMLIonRangeElement;
    // const lower = range.value?.lower ?? 0;
    // const upper = range.value?.upper ?? 0;
    // console.log(`Rang ${color} canviat: Lower=${lower}, Upper=${upper}`);
    // this.dmxService.SetDMX(`u=3&d=${color==='red'?lower:0},${color==='green'?lower:0},0`);
  
    console.log('ionChange emitted value:', event);
  }
  onSegmentChanged(event: any) {
    console.log('Segmento cambiado:', event.detail.value);
    this.segmentValue = event.detail.value;
    if (this.segmentValue === 'llista') {
      this.fabButtons = [
        { icon: '/svg/trash-outline.svg',
          action: () => this.ClearPlaylistMusicCurrent()
        }
      ];  
    }
  }
  private ClearPlaylistMusicCurrent() {
    let self = this;
    if (this.llistaCurrentMusic.length===0) {
      // Ja està buida
      console.log('La llista ja està buida');
      this.setOpenToast(true, 'La llista ja està buida');
      return;
    }
    this.kodiSocket.sendMessage('Playlist.Clear',
        { 
          playlistid: self.playlistIdMusic
        });
  }
  setOpenToast(isOpen: boolean, message: string = '') {
    this.txtToastMessage = message;
    this.isToastOpen = isOpen;
  }
private RefrescarLlistaFiles(llista : any[]) : any[] {  
  let self = this;
  llista = llista.map((fi) => ({
    ...fi,
    added: self.llistaCurrentMusic.some((music: any) => self.getNomCurt(music.file,music.titlecustom) === self.getNomCurt(fi.file,fi.titlecustom)),
    favorite: self.musicfavorite.some((favorite: any) => favorite.nom === self.getNomCurt(fi.file,fi.titlecustom)),
    inTempList: self.musiccuatemp.some((cua: any) => cua.nom === self.getNomCurt(fi.file,fi.titlecustom))
    }));
  return llista;
}  
  getParentDirectory(path: string, nivell: number = 1): string {
    if (!path) return '';
    // Elimina la barra final si n'hi ha
    if (path.endsWith('/')) path = path.slice(0, -1);
    let parts = path.split('/');
    // Elimina tants elements com nivell
    for (let i = 0; i < nivell; i++) {
      parts.pop();
    }
    return parts.length > 0 ? parts.join('/') + '/' : '/';
  }
  onAlertDidDismiss() {
    this.isAlertOpen = false;
  }
  getNomCurt(path: string, custom: string): string { //, label: string): string {
    //if (label && label.length > 0) return this.getNomCurt(label,'', '');
    if (custom && custom.length > 0) return custom;
    if (!path) return '';
    // Elimina la barra final si n'hi ha
    if (path.endsWith('/')) path = path.slice(0, -1);
    // Agafa l'últim segment del path
    let nom = path.split('/').pop() || '';
    // Si té punt i no és una carpeta, elimina l'extensió
    if (nom.includes('.')) {
      nom = nom.substring(0, nom.lastIndexOf('.'));
    }
    return nom;
  }
  recibirFoco(event: any) {
    console.log("Evento, recibido desde TouchCircleComponent:", event);
  }
  ClickButton() {
    console.log("ClickButton");
  }
  private ExisteixCansoLlista(file: string) : boolean {
    return this.llistaCurrentMusic.find((fi: any) => fi.file === file);
  }
  onItemPlay(item: any, index: number) {
    console.log('Item:', item, 'Índex:', index);
    let self = this;
    this.kodiSocket.sendMessage('Player.Open',
      { 
        item: { 
          playlistid: self.playlistIdMusic, 
          position: index 
        }
      });
  }
  onItemFavorits(item: any, index: number) {
    console.log('Item:', item, 'Índex:', index);
    let self = this;
    this.addPlaylistInsertMusic(item.file, this.llistaCurrentMusic.length, false);  
  }
  onItemClick(item: any) {
    if (item.filetype === 'directory') {
      let self = this;
      this.directoryClick = item.file;
      this.kodiSocket.sendMessage('Files.GetDirectory', 
        { 
          directory: this.directoryClick, 
          media: "music",
          properties: ["title", "file", "mimetype", "thumbnail", "dateadded","duration"],
          sort: { 
            method: "dateadded", 
            order: "descending" 
          }
      },function(response: any) {
        let llistaTemp = response.result?.files || [];
        //self.llistaFiles = response.result?.files || [];
        llistaTemp=self.RefrescarLlistaFiles(llistaTemp);
        llistaTemp = [
          {
            file: self.getParentDirectory(self.directoryClick),
            filetype: 'directory',
            label: '..',
            mimetype: 'x-directory/normal',
            thumbnail: '',
            title: '..',
            titlecustom:'..',
            type: 'unknown'
          },
          ...(llistaTemp || [])
        ];          
        self.directoryCurrent = self.directoryClick;
        self.llistaFiles = llistaTemp;
        //self.pAddExtraDataLlistaFiles();
        self.directoryClick = "";
        console.log('Respuesta del socket:', response);
      });

      // const payload = [{
      //   jsonrpc:"2.0",
      //   method:"Files.GetDirectory",
      //   id:"1",
      //   params:{
      //     directory:this.directoryClick,
      //     media:"music",
      //     properties:["title","file","mimetype","thumbnail","dateadded"],
      //     sort:{
      //       method:"none",
      //       order:"ascending"
      //       }
      //     }
      //   }];
      // this.dataService.sendMessage(payload).subscribe(response => {
      //     this.llistaFiles = response[0].result?.files || [];
      //   console.log('Respuesta:', JSON.stringify(response[0].result?.files));
      // },
      // error => {
      //   console.error('Error en la petición:', error);
      // });
      // this.directoryCurrent = this.directoryClick;
    }else{
      // Aquí puedes gestionar el clic en un archivo
      console.log('Has clicat en un fitxer:', item);
      //Cridar al socket de Kodi per posar a la cua de reproducció
      let self = this;
      if (this.ControlMusic) {
        if (this.ExisteixCansoLlista(item.file)) {
          // Ja existeix a la llista
          console.log('Aquesta cançó ja està afegida a la llista');
          self.txtAlertTitle='Control de música';
          self.txtAlertMessage='Aquesta cançó ja està afegida a la llista';
          self.alertButtons = ['D\'acord'];
          self.isAlertOpen = true;
          return;
        }
      }
      this.addPlaylistInsertMusic(item.file, this.llistaCurrentMusic.length, false);
    }
    console.log('Ruta sencera:', item.file);
  }  
  private pAddExtraDataLlistaFiles() {
    // Afegir propietat played a true a la llistaFiles quan el nom del file estigui també la llista de llistaCurrentMusic
    this.llistaFiles = this.llistaFiles.map((fi) => {
      return {
        ...fi,
        added: fi.type=='file' && this.ExisteixCansoLlista(fi.file)
      };
    });
  }
  
  AugmentarVolumKodi(){
    this.kodiSocket.sendMessage('Application.SetVolume', { volume: 'increment' });
  }
  DisminuirVolumKodi(){
    this.kodiSocket.sendMessage('Application.SetVolume', { volume: 'decrement' });
  }
  ToggleMuteKodi(){
    this.kodiSocket.sendMessage('Application.SetMute', { mute: 'toggle' });
  }
  private LoadPlaylistMusicCurrent(item?: any) {
    let self = this;
    this.kodiSocket.sendMessage('Playlist.GetItems', 
      { 
        playlistid: this.playlistIdMusic,
        properties: ["file", "duration"]
      }, (response: any) => {
        self.llistaCurrentMusic = response.result?.items || [];
        self.llistaFiles=self.RefrescarLlistaFiles(self.llistaFiles);
        console.log('Resposta del socket:', response);
        console.log('Mostrar toast', item);
        if (item && item.playlistid===self.playlistIdMusic && 
          self.llistaCurrentMusic.length>0 && 
          item.position<self.llistaCurrentMusic.length) {
            let itemPos = self.llistaCurrentMusic[item.position];
            self.setOpenToast(true, `Afegit: ${self.getNomCurt(itemPos.file,itemPos.titlecustom)}`);
        }
      });
  }
  private addPlaylistInsertMusic(file: string, position: number, isdirectory: boolean) {
    let self = this;
    this.kodiSocket.sendMessage('Playlist.Insert',
        { 
          playlistid: self.playlistIdMusic,
          position: position, 
          item: isdirectory?{ directory: file }:{ file: file }
        });
  }
  private GetTypeLists() {
    let self = this;
    this.kodiSocket.sendMessage('Playlist.GetPlaylists', {}, (response: any) => {
      console.log('Resposta del socket GetPlaylists:', response);
      self.playlistIdMusic = response.result.find((pl: any) => pl.type === 'audio')?.playlistid;
      self.playlistIdVideo = response.result.find((pl: any) => pl.type === 'video')?.playlistid;
      self.playlistIdPicture = response.result.find((pl: any) => pl.type === 'picture')?.playlistid;
    });
  }
  formatDuration(totaltime: any): string {
    if (!totaltime) return '';
    const hours = totaltime.hours || 0;
    const minutes = totaltime.minutes || 0;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  ParseTimeDuration(duration: number | undefined | null): string {
    try {
      if (!duration) return '';
      const hores = Math.trunc(duration / 3600);
      const durationsensehores = duration - (hores * 3600);
      const minuts = Math.trunc(durationsensehores / 60);
      const segons = durationsensehores - (minuts * 60);
      if (hores > 0) {
        return `${hores}:${('' + minuts).padStart(2, '0')}:${('' + segons).padStart(2, '0')}`;
      } else {
        return `${minuts}:${('' + segons).padStart(2, '0')}`;
      }
    } catch (e) {
      return '-:--';
    }
  }

  private initialized: boolean = false;
  onConnectedSocketReceived(event: { result: boolean }) {
    console.log('Event socket connectat:', event);
    if (this.initialized) return;
    this.initialized = true;
    console.log('Socket conectat, inicialitzant...');
    // Aquí pots posar el codi que vols executar quan el socket es connecta
    this.LoadPlaylistMusicCurrent();
    this.GetTypeLists();
    // Carregar el directori inicial
    let self = this;
    this.kodiSocket.sendMessage('Files.GetSources', 
      {
		    media:'music'
	    }, (response: any) => {
        console.log('Resposta del socket:', response);
        const tempSources = (response.result.sources || []).map((item: any) => ({
          ...item,
          filetype: 'directory',
          titlecustom: item.label
        }));
        self.llistaFiles = tempSources;
        console.log('Resposta del socket 2:', self.llistaFiles);
      }
    );
  }
  private toggleItemInList(
    item: any,
    storageKey: string,
    currentList: any[],
    flagProp: string,
    updateList: (newList: any[]) => void
  ): void {
    const nom = this.getNomCurt(item.file, '');
    const index = currentList.findIndex(el => el.nom === nom);
    let save = false;

    const clonList = JSON.parse(JSON.stringify(currentList));

    if (index === -1) {
      if (item[flagProp] === undefined || item[flagProp] === false) {
        const clonItem = JSON.parse(JSON.stringify(item));
        clonItem.nom = nom;
        clonItem[flagProp] = true;
        clonList.push(clonItem);
        save = true;
      }
    } else {
      if (item[flagProp] === true) {
        save = true;
      }
      clonList.splice(index, 1);
    }

    if (save) {
      this.storage.set(storageKey, clonList).then(() => {
        item[flagProp] = !item[flagProp];
        updateList(clonList);
      });
    }
  }
  toggleFavorite(item: any) {
    this.toggleItemInList(
      item,
      'musicfavorite',
      this.musicfavorite,
      'favorite',
      (newList) => this.musicfavorite = newList
    );
  }

  toggleTempList(item: any) {
    this.toggleItemInList(
      item,
      'musiccuatemp',
      this.musiccuatemp,
      'inTempList',
      (newList) => this.musiccuatemp = newList
    );
  }  
  xxtoggleTempList(item: any) {
    item.inTempList = !item.inTempList;
    console.log(`Archivo ${item.file} en lista temporal: ${item.inTempList}`);
    // Aquí podrías guardar cambios o emitir evento
  }

  // Función para recibir los datos emitidos desde el componente hijo (TouchCircleComponent)
  onFocoDataReceived(focoData: { pan: number, tilt: number }) {
    console.log("Datos , recibidos desde TouchCircleComponent:", focoData);
    // Aquí puedes hacer lo que necesites con los datos (pan y tilt)
    // Por ejemplo, pasar los datos al servicio DMX
    this.dmxService.SetDMX(`u=1&d=${focoData.pan},0,${focoData.tilt}`);
  }
  sendTestMessage() {
    const payload = {
      jsonrpc: "2.0",
      method: "Input.Up",
      id: 1,
      params: {}
    };
    this.dataService.sendMessage(payload).subscribe(
      res => console.log('Respuesta Input.Up:' + res), //this.Data = res,
      err => console.error('Error en la petición:', err)
    );
  }

  // onTouchStart(event: MouseEvent | TouchEvent) {
  //   event.preventDefault();

  //   if (event instanceof MouseEvent) {
  //     // Es un evento de ratón
  //     this.updateTouchPosition(event.clientX, event.clientY);
  //   } else if (event instanceof TouchEvent) {
  //     // Es un evento de toque
  //     const touch = event.touches[0];
  //     this.updateTouchPosition(touch.clientX, touch.clientY);
  //   }
  // }

  // onTouchMove(event: MouseEvent | TouchEvent) {
  //   event.preventDefault();

  //   if (event instanceof MouseEvent) {
  //     // Es un evento de ratón
  //     if (this.touchPosition) {
  //       this.updateTouchPosition(event.clientX, event.clientY);
  //     }
  //   } else if (event instanceof TouchEvent) {
  //     // Es un evento de toque
  //     if (this.touchPosition) {
  //       const touch = event.touches[0];
  //       this.updateTouchPosition(touch.clientX, touch.clientY);
  //     }
  //   }
  // }

  // updateTouchPosition(clientX: number, clientY: number) {
  //   const rect = this.touchArea.nativeElement.getBoundingClientRect();
    
  //   const x = clientX - rect.left;
  //   const y = clientY - rect.top;

  //   const centerX = rect.width / 2;
  //   const centerY = rect.height / 2;

  //   const relativeX = (x - centerX) / centerX;
  //   const relativeY = (centerY - y) / centerY;

  //   if (relativeX ** 2 + relativeY ** 2 <= 1) {
  //     this.touchPosition = { x, y };

  //     const pan = Math.round((relativeX + 1) / 2 * 255);
  //     const tilt = Math.round((relativeY + 1) / 2 * 255);

  //     console.log('PAN:', pan, 'TILT:', tilt);
  //     this.sendToFoco(pan, tilt);
  //   }
  // }

  // sendToFoco(x: number, y: number) {
  //   console.log(`Enviando a foco - PAN: ${x}, TILT: ${y}`);
  //   this.dmxService.SetDMX('u=3&d='+x+','+y);
  // }


}

