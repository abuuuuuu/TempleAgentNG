import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent,IonSegment,IonSegmentContent,IonLabel,IonSegmentView,IonSegmentButton } from '@ionic/angular/standalone';
//import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent,IonSegment,IonSegmentContent,IonLabel,IonSegmentView,IonSegmentButton ]
})
export class Tab2Page {

  constructor() {}

}
