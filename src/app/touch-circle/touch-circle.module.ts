// touch-circle.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TouchCircleComponent } from './touch-circle.component';

@NgModule({
  declarations: [TouchCircleComponent], // Declarar TouchCircleComponent aquí
  imports: [CommonModule], // Importar CommonModule para ngIf, ngStyle, etc.
  exports: [TouchCircleComponent], // Exportarlo para usarlo en otros módulos
})
export class TouchCircleModule {}
