import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { TouchCircleComponent } from 'src/app/touch-circle/touch-circle.component';// '../touch-circle/touch-circle.component'; // Importa el componente

@Component({
  selector: 'app-prova-screen-begin',
  standalone: true,
  templateUrl: './prova-screen-begin.page.html',
//  styleUrls: ['./prova-screen-begin.page.scss'],
  imports: [
    IonicModule,
    TouchCircleComponent // Asegúrate de importar el componente aquí
    ]
})
export class ProvaScreenBegin {
  constructor(private alertController: AlertController) {}

  async showAlert() {
    const alert = await this.alertController.create({
      header: 'Hola!',
      message: 'Has premut el botó!',
      buttons: ['OK']
    });
    await alert.present();
  }
}