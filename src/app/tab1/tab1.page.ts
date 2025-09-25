import { Component, ViewEncapsulation } from '@angular/core';
import { IonInput } from '@ionic/angular/standalone';
import {  OnInit,ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { KodiService } from '../services/kodi.service'; 
import { DMXService } from '../services/dmx.service'; 
//import { IonicModule } from '@ionic/angular';
//import { FormsModule } from '@angular/forms';
import { KodiSocketService } from '../services/kodi-socket.service';
import { Subscription } from 'rxjs';
import { TouchCircleComponent } from '../touch-circle/touch-circle.component'; // Importa el componente
//import { ExploreContainerComponent } from '../explore-container/explore-container.component'; // Ajusta el path si cal
import { StorageService } from '../services/storage.service';
import { RangeCustomEvent } from '@ionic/core';
//import { Http } from '@capacitor-community/http';
import { IonFab,IonFabButton,IonFabList } from '@ionic/angular/standalone';
import { ActionSheetController } from '@ionic/angular';
import { IonActionSheet, IonButton,IonAlert } from '@ionic/angular/standalone';
//import { ChangeDetectorRef } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

//ionic serve --proxy-config proxy.conf.json
@Component({
  selector: 'app-tab1',
  standalone: true,
  templateUrl: './tab1.page.html',
//  styleUrls: ['./tab1.page.scss'],
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    ion-content {
      flex: 1 1 auto;
    }
  `],
  imports: [
    //IonicModule, 
 //   ExploreContainerComponent,
    CommonModule, 
    //FormsModule, 
    TouchCircleComponent,FormsModule,
    IonFab,IonFabButton,IonFabList,IonActionSheet, IonButton,IonAlert
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.Emulated  // Asegúrate de que la encapsulación sea emulada (que es la predeterminada)
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
  redRange = { lower: 0, upper: 200 }; // placeholder inicial
  greenRange = { lower: 0, upper: 100 }; // placeholder inicial
  minValue = 0;
  maxValue = 255;
  musicplayed:any[]=[];
  musicfavorite:any[]=[];
  musiccuatemp:any[]=[];
  currentTrack: any = null;
  isPlaying :boolean=true;
  private progressInterval: any = null;
  progressPercent = 0;
  timeRemaining = 0; // Temps restant en segons
  searchText: string = '';
  isSearchOpen: boolean = false;

  
  fabButtons = [
    { icon: 'assets/svg/search.svg',
      action: () => this.openSearch()
    }
  ];  
  
  isActionSheetOpen = false;
  public actionSheetButtons: Array<{
  text: string;
  role?: string;
  handler?: (() => void | Promise<void>) | null;
  data?: any;
  }> = [];

  @ViewChild('touchArea') touchArea!: ElementRef;
  @ViewChild(IonInput) searchInput!: IonInput;
  touchPosition: { x: number, y: number } | null = null;

  urlKodi :string='';
  urlSocketKodi :string='';
  urlDMX :string='';

  constructor(
    private kodiSocket: KodiSocketService,
    private dmxService: DMXService,
    private storage: StorageService,
    private actionSheetCtrl: ActionSheetController,
//    private cdr: ChangeDetectorRef 
) {
    console.log('Tab1Page cargado');
  }

  TestFuncio() {
    console.log("TestFuncio");
  }

  async ngOnInit() {
    this.urlKodi =this.kodiSocket.url;
    //this.urlSocketKodi =this.dataService.apiUrl;
    this.urlDMX =this.dmxService.apiUrl;
    
    this.kodiSocket.onConnected$.subscribe((event) => {
      this.onConnectedSocketReceived(event);
      console.log('Prova socket:' ,event);
      this.connectedSocket=event.result;
    });
    let data:any = await this.loadFromStorage('musicplayed');
    if (data){
      this.musicplayed = data;
    }else{
      this.musicplayed = [];
    }
    console.log('Music played loaded from storage:', this.musicplayed.length);

    data=await this.loadFromStorage('musicfavorite');
    if (data) {
      this.musicfavorite=this.RefrescarLlistaFiles(data);
    }else{
      this.musicfavorite = [];
    }
    data = await this.loadFromStorage('musiccuatemp');
    if (data) {
      this.musiccuatemp=this.RefrescarLlistaFiles(data);
    }
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
    this.socketSub = this.kodiSocket.getMessages().subscribe(async (msg) => {
      console.log('[Tab1] Evento recibido:', msg);
      if (msg.method && msg.method.startsWith('Playlist.')) {
        console.log('Evento de Playlist recibido:', msg);
        if (msg.method === 'Playlist.OnAdd' || msg.method === 'Playlist.OnRemove' || msg.method === 'Playlist.OnClear') {
            await self.LoadPlaylistMusicCurrent();
            if (msg.method === 'Playlist.OnClear') {
              self.setOpenToast(true, 'Llista buidada');
              self.currentTrack = null;
              self.stopProgressUpdater();
              self.progressPercent = 0;
              self.timeRemaining=0;
            }
        }
      }
      if (msg.method==='Application.OnVolumeChanged') {
        console.log('Volum canviat:', msg.params.data.volume);
        if (msg.params.data.muted) {
          self.setOpenToast(true, 'Volum mut');
        }else{
          self.setOpenToast(true, `Volum: ${msg.params.data.volume}`);
        }
      }
      if (msg.method === 'Player.OnStop') {  
        this.getCurrentPlayingSong(true);
      }
      if (msg.method === 'Player.OnPlay' || 
        msg.method === 'Player.OnPause' || 
        msg.method === 'Player.OnResume' || 
        msg.method === 'Player.OnSeek' || 
        msg.method === 'Player.OnSpeedChanged') {
        if (msg.params.data && msg.params.data.player && msg.params.data.player.playerid === self.playlistIdMusic) {
          console.log('Player event:', msg.method);
          this.getCurrentPlayingSong(
            false,
            msg.method === 'Player.OnPlay' ? async () => {
              self.currentTrack.nomcurt = self.getNomCurt(self.currentTrack.file,self.currentTrack.titlecustom);
              self.currentTrack.dateplayed = new Date().toISOString();
              self.musicplayed.push(self.currentTrack);
              await self.storage.set('musicplayed', self.musicplayed);
            } : undefined
          );
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
    //setTimeout(() => {
      //this.redRange = { lower: 100, upper: 150 };
    //},1000);
  }
  async treureItemCurrentMusic(item: any) { 
    let self = this;
    const index = this.llistaCurrentMusic.indexOf(item);
    if (index > -1) {
      await this.kodiSocket.sendMessage('Playlist.Remove',
        {
          playlistid: self.playlistIdMusic,
          position: index
        });
    }
  }
  getCurrentTrackIndex(): number {
    if (!this.currentTrack || !this.llistaCurrentMusic.length) return -1;
    return this.llistaCurrentMusic.findIndex(
      item => item.file === this.currentTrack.file
    );
  }
  get totalDuration(): number {
    // return this.llistaCurrentMusic.reduce((sum, item) => {
    //   const dur = Number(item.duration);
    //   return sum + (isNaN(dur) || !dur ? 0 : dur);
    // }, 0);
    const idx = this.getCurrentTrackIndex();
    if (idx < 0 || idx >= this.llistaCurrentMusic.length - 1) return this.timeRemaining;
    return (this.llistaCurrentMusic
      .slice(idx+1)
      .reduce((sum, item) => sum + (Number(item.duration) || 0), 0)) + this.timeRemaining;
  }
  
  get filteredllistaFiles() {
    if (!this.searchText.trim()) {
      return this.llistaFiles;
    }

    const lower = this.searchText.toLowerCase();
    return this.llistaFiles.filter(file =>
      this.getNomCurt(file.file,'').toLowerCase().includes(lower)
    );
  }
  openSearch() {
    this.isSearchOpen = true;
  }

  closeSearch() {
    this.isSearchOpen = false;
  }
  setOpenActionSheet(isOpen: boolean, item?: any, index?: number, segmentType?: string) {
    if (isOpen && item && segmentType === 'cuatemp') {
      this.actionSheetButtons = [
        {
          text: 'Afegir següent a l\'actual',
          handler: () => {
            let indexCurrent = this.llistaCurrentMusic.findIndex(el => el.file === this.currentTrack.file);
            // xxx
            // let indexCurrent = this.llistaCurrentMusic.indexOf(this.currentTrack);
            if (indexCurrent >= 0) {
              indexCurrent=indexCurrent + 1;
            }
            console.log('Afegir següent a l\'actual, index:', indexCurrent);
            this.onItemCuaTemp(item, indexCurrent);
          }
        },
        {
          text: 'Cancel·lar',
          role: 'cancel'
        }
      ];
    } else if (isOpen && item && segmentType === 'llista') {
      this.actionSheetButtons = [
        {
          text: 'Eliminar de la cua',
          handler: () => this.treureItemCurrentMusic(item)
        },
        {
          text: 'Cancel·lar',
          role: 'cancel'
        }
      ];
    } else {
      this.actionSheetButtons = [
        {
          text: 'Cancel·lar',
          role: 'cancel'
        }
      ];
    }
    this.isActionSheetOpen = isOpen;
}
  private async loadFromStorage<T = any>(key: string): Promise<T | null> {
    return await this.storage.get(key);
  }
  async getCurrentPlayingSong(isStop: boolean = false, callBackOnPlay?: () => void) {
    let self = this;
    if (isStop) {
      self.isPlaying = false;
      self.currentTrack = null;
      console.log('Reproducció aturada');
    }
    let playersResp = await this.kodiSocket.sendMessageAsync('Player.GetActivePlayers', {});
    if (playersResp)  {
      const musicPlayer = (playersResp.result || []).find((p: any) => p.type === 'audio' && p.playerid === this.playlistIdMusic);
      if (musicPlayer) {
        let itemResp:any=await this.kodiSocket.sendMessageAsync('Player.GetItem', 
          { 
            playerid: musicPlayer.playerid,
            properties: ["file", "duration"]
          }); 
        if (itemResp) {
          if (itemResp.result && itemResp.result.item) {
            if (isStop) {
              self.isPlaying = false;
              self.currentTrack = null;
            } else {
              self.isPlaying = true;
              self.currentTrack = itemResp.result.item;
              this.startProgressUpdater(musicPlayer.playerid, self.currentTrack.duration); // <-- inicia la barra            
              if (callBackOnPlay) callBackOnPlay();
            }
            // Pots fer servir this.currentTrack.nom = this.getNomCurt(this.currentTrack.file, this.currentTrack.label);
          } else {
            self.isPlaying = false;
            self.currentTrack = null;
            this.stopProgressUpdater();
          }
          //self.cdr.detectChanges(); 

        }
      } else {
        self.isPlaying = false;
        self.currentTrack = null;
        this.stopProgressUpdater();
        console.log('No hi ha cap cançó reproduint-se');
        //self.cdr.detectChanges(); 
      }
    }
  }
  private async startProgressUpdater(playerid: number, duration: number) {
    // Neteja intervals anteriors
    console.log('Iniciant actualitzador de progrés per a playerid:', playerid, 'amb durada:', duration);
    if (this.progressInterval) {
      console.log('Netejant interval anterior de progrés');
      clearInterval(this.progressInterval);
    }
    this.progressInterval = setInterval(async () => {
      let resp: any=await this.kodiSocket.sendMessageAsync('Player.GetProperties', {
        playerid,
        properties: ['time']
      })
      if (resp)  {
        if (resp.result && resp.result.time) {
          const t = resp.result.time;
          const currentSeconds = (t.hours || 0) * 3600 + (t.minutes || 0) * 60 + (t.seconds || 0);
          this.updateProgress(currentSeconds, duration);
        }
      }
    }, 1000); // Actualitza cada segon
  }
  private stopProgressUpdater() {
    console.log('Aturant actualitzador de progrés');
    if (this.progressInterval) {
      console.log('Netejant interval de progrés');
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
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
    console.log('Canço actual:', this.currentTrack);
    this.segmentValue = event.detail.value;
    if (this.segmentValue === 'llista') {
      this.fabButtons = [
        { icon: 'assets/svg/trash-outline.svg',
          action: () => this.ClearPlaylistMusicCurrent()
        }
      ];  
    }
    if (this.segmentValue === 'first') {
      this.fabButtons = [
        { icon: 'assets/svg/search.svg',
          action: () => this.openSearch()
        }
      ];  
    }
  }
  performSearch() {
    console.log('Buscando:', this.searchText);
    this.searchText='';
    this.closeSearch();
  }

  private async ClearPlaylistMusicCurrent() {
    let self = this;
    if (this.llistaCurrentMusic.length===0) {
      // Ja està buida
      console.log('La llista ja està buida');
      this.setOpenToast(true, 'La llista ja està buida');
      return;
    }
    await this.kodiSocket.sendMessageAsync('Playlist.Clear',
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
  async onItemPlay(item: any, index: number) {
    console.log('Item:', item, 'Índex:', index);
    let self = this;
    await this.kodiSocket.sendMessageAsync('Player.Open',
      { 
        item: { 
          playlistid: self.playlistIdMusic, 
          position: index 
        }
      });
  }
  async onItemFavorits(item: any, index: number) {
    console.log('Item:', item, 'Índex:', index);
    let self = this;
    if (this.ExisteixCansoLlista(item.file)) {
      self.txtAlertTitle='Control de música';
      self.txtAlertMessage='Aquesta cançó ja està afegida a la llista';
      self.alertButtons = ['D\'acord'];
      self.isAlertOpen = true;
      return;
    }

    await this.addPlaylistInsertMusic(item.file, this.llistaCurrentMusic.length, false);  
  }
  async onItemCuaTemp(item: any, index: number=-1) {
    console.log('Item:', item);
    let self = this;
    if (this.ExisteixCansoLlista(item.file)) {
      self.txtAlertTitle='Control de música';
      self.txtAlertMessage='Aquesta cançó ja està afegida a la llista';
      self.alertButtons = ['D\'acord'];
      self.isAlertOpen = true;
      return;
    }
    if (index < 0 || index >= this.llistaCurrentMusic.length) {
      index = this.llistaCurrentMusic.length;
    }
    await this.addPlaylistInsertMusic(item.file, index, false);
    this.toggleTempList(item);
  }
  async onItemClick(item: any) {
    if (item.filetype === 'directory') {
      let self = this;
      this.directoryClick = item.file;
      let response: any=await this.kodiSocket.sendMessageAsync('Files.GetDirectory', 
        { 
          directory: this.directoryClick, 
          media: "music",
          properties: ["title", "file", "mimetype", "thumbnail", "dateadded","duration"],
          sort: { 
            method: "dateadded", 
            order: "descending" 
          }
      });
      if (response) {
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
        self.searchText='';
        console.log('Respuesta del socket:', response);
      }
    }else{
      let self = this;
      if (this.ControlMusic) {
        if (this.ExisteixCansoLlista(item.file)) {
          self.txtAlertTitle='Control de música';
          self.txtAlertMessage='Aquesta cançó ja està afegida a la llista';
          self.alertButtons = ['D\'acord'];
          self.isAlertOpen = true;
          return;
        }
      }
      await this.addPlaylistInsertMusic(item.file, this.llistaCurrentMusic.length, false);
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
  
  async AugmentarVolumKodi(){
    await this.kodiSocket.sendMessageAsync('Application.SetVolume', { volume: 'increment' });
  }
  async DisminuirVolumKodi(){
    await this.kodiSocket.sendMessageAsync('Application.SetVolume', { volume: 'decrement' });
  }
  async ToggleMuteKodi(){
    await this.kodiSocket.sendMessageAsync('Application.SetMute', { mute: 'toggle' });
  }
  // private LoadPlaylistMusicCurrent() {
  //   try {
  //     const response: any = await new Promise((resolve, reject) => {
  //       let resp:any=this.kodiSocket.sendMessageAsync(
  //         'Playlist.GetItems',
  //         {
  //           playlistid: this.playlistIdMusic,
  //           properties: ['file', 'duration']
  //         });
  //       if (resp) {
  //           if (resp && resp.result) {
  //             resolve(resp);
  //           } else {
  //             reject('Error al obtener la lista de reproducción');
  //           }
  //         }
        
  //     });

  //     this.llistaCurrentMusic = response.result.items || [];
  //     this.llistaFiles = this.RefrescarLlistaFiles(this.llistaFiles);
  //     this.musiccuatemp = this.RefrescarLlistaFiles(this.musiccuatemp);
  //     this.musicfavorite = this.RefrescarLlistaFiles(this.musicfavorite);

  //     if (
  //       item &&
  //       item.playlistid === this.playlistIdMusic &&
  //       this.llistaCurrentMusic.length > 0 &&
  //       item.position < this.llistaCurrentMusic.length
  //     ) {
  //       const itemPos = this.llistaCurrentMusic[item.position];
  //       this.setOpenToast(true, `Afegit: ${this.getNomCurt(itemPos.file, itemPos.titlecustom)}`);
  //     }

  //   } catch (error) {
  //     console.error('Error en LoadPlaylistMusicCurrent:', error);
  //   }
  // }

  private async LoadPlaylistMusicCurrent(item?: any) {
    let self = this;
    let response = await this.kodiSocket.sendMessageAsync('Playlist.GetItems', 
      { 
        playlistid: this.playlistIdMusic,
        properties: ["file", "duration"]
      });
    if (response)  {
        self.llistaCurrentMusic = response.result?.items || [];
        self.llistaFiles=self.RefrescarLlistaFiles(self.llistaFiles);
        self.musiccuatemp=self.RefrescarLlistaFiles(self.musiccuatemp);
        self.musicfavorite=self.RefrescarLlistaFiles(self.musicfavorite);
        
        if (item && item.playlistid===self.playlistIdMusic && 
          self.llistaCurrentMusic.length>0 && 
          item.position<self.llistaCurrentMusic.length) {
            let itemPos = self.llistaCurrentMusic[item.position];
            self.setOpenToast(true, `Afegit: ${self.getNomCurt(itemPos.file,itemPos.titlecustom)}`);
        }
      }
  }
  // private addPlaylistInsertMusic(file: string, position: number, isdirectory: boolean) {
  //   let self = this;
  //   this.kodiSocket.sendMessage('Playlist.Insert',
  //       { 
  //         playlistid: self.playlistIdMusic,
  //         position: position, 
  //         item: isdirectory?{ directory: file }:{ file: file }
  //       });
  // }
  private async addPlaylistInsertMusic(file: string, position: number, isdirectory: boolean) {
    await this.kodiSocket.sendMessageAsync(
        'Playlist.Insert',
        {
          playlistid: this.playlistIdMusic,
          position: position,
          item: isdirectory ? { directory: file } : { file: file }
        });
  }

  private async GetTypeLists() {
    let self = this;
    let response=await this.kodiSocket.sendMessageAsync('Playlist.GetPlaylists', {});
    if (response) {
      console.log('Resposta del socket GetPlaylists:', response);
      self.playlistIdMusic = response.result.find((pl: any) => pl.type === 'audio')?.playlistid;
      self.playlistIdVideo = response.result.find((pl: any) => pl.type === 'video')?.playlistid;
      self.playlistIdPicture = response.result.find((pl: any) => pl.type === 'picture')?.playlistid;
    }
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
      return '';
    }
  }

  private initialized: boolean = false;
  async onConnectedSocketReceived(event: { result: boolean }) {
    console.log('Event socket connectat:', event);
    if (this.initialized) return;
    this.initialized = true;
    console.log('Socket conectat, inicialitzant...');
    // Aquí pots posar el codi que vols executar quan el socket es connecta
    await this.LoadPlaylistMusicCurrent();
    this.GetTypeLists();
    this.getCurrentPlayingSong();
    // Carregar el directori inicial
    let self = this;
    let response: any=await this.kodiSocket.sendMessageAsync('Files.GetSources', 
      {
		    media:'music'
	    });
    console.log('Resposta del socket 1:', response);
    if (response) {
        console.log('Resposta del socket 2:', response);
        if (response.error) {
          // Si hay un error en la respuesta
          console.error('Error en la respuesta del socket:', response.error);
          // Aquí puedes manejar el error de la manera que quieras
          return;  // Termina la ejecución en caso de error
        }
        const tempSources = (response.result.sources || []).map((item: any) => ({
          ...item,
          filetype: 'directory',
          titlecustom: item.label
        }));
        self.llistaFiles = tempSources;
        console.log('Resposta del socket 2:', self.llistaFiles);
      }
  }
  private async toggleItemInList(
    item: any,
    storageKey: string,
    currentList: any[],
    flagProp: string,
    updateList: (newList: any[]) => void
  ) {
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
      await this.storage.set(storageKey, clonList);
      item[flagProp] = !item[flagProp];
      updateList(clonList);
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
    this.musicfavorite=this.RefrescarLlistaFiles(this.musicfavorite);
  }

  toggleTempList(item: any) {
    this.toggleItemInList(
      item,
      'musiccuatemp',
      this.musiccuatemp,
      'inTempList',
      (newList) => this.musiccuatemp = newList
    );
    this.musiccuatemp=this.RefrescarLlistaFiles(this.musiccuatemp);
  }  

  // Función para recibir los datos emitidos desde el componente hijo (TouchCircleComponent)
  onFocoDataReceived(focoData: { pan: number, tilt: number }) {
    console.log("Datos , recibidos desde TouchCircleComponent:", focoData);
    // Aquí puedes hacer lo que necesites con los datos (pan y tilt)
    // Por ejemplo, pasar los datos al servicio DMX
    this.dmxService.SetDMX(`u=1&d=${focoData.pan},0,${focoData.tilt}`);
  }
  // sendTestMessage() {
  //   const payload = {
  //     jsonrpc: "2.0",
  //     method: "Input.Up",
  //     id: 1,
  //     params: {}
  //   };
  //   this.dataService.sendMessage(payload)
  //   .then(res => {
  //     console.log('Respuesta Input.Up:', res);
  //     // this.Data = res;
  //   })
  //   .catch(err => {
  //     console.error('Error en la petición:', err);
  //   });
  // }
  async playPrevious() {
    await this.kodiSocket.sendMessageAsync('Player.GoTo', { playerid: 0, to: 'previous' });
  }
  
  async playNext() {
    await this.kodiSocket.sendMessageAsync('Player.GoTo', { playerid: 0, to: 'next' });
  }
  async togglePlayPause() {
    await this.kodiSocket.sendMessageAsync('Player.PlayPause', { playerid: 0 });
  }
  async stopPlayback() {
    await this.kodiSocket.sendMessageAsync('Player.Stop', { playerid: 0 });
  }

  updateProgress(currentTime: number, totalDuration: number) {
    this.progressPercent = totalDuration ? (currentTime / totalDuration) * 100 : 0;
    this.timeRemaining = totalDuration - currentTime;
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

