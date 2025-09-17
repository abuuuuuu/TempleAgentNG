import { Component } from '@angular/core';
//import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  //imports: [IonApp, IonRouterOutlet, RouterModule,IonicModule],
  imports: [RouterModule,IonicModule],
})
export class AppComponent {
  constructor() {}

}