// tab1.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tab1Page } from './tab1.page';
import { TouchCircleModule } from '../touch-circle/touch-circle.module'; // Importación correcta

@NgModule({
  imports: [
    CommonModule,
    TouchCircleModule, // Este módulo importa TouchCircleComponent
  ],
  declarations: [Tab1Page],
})
export class Tab1PageModule {}
