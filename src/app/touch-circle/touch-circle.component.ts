import { NgModule } from '@angular/core';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-touch-circle',
  templateUrl: './touch-circle.component.html',
  styleUrls: ['./touch-circle.component.scss'],
  imports: [CommonModule]
})

export class TouchCircleComponent implements OnInit, OnDestroy {
  @ViewChild('touchArea') touchArea!: ElementRef;
  touchPosition: { x: number, y: number } | null = null;
  @Output() focoData: EventEmitter<{ pan: number, tilt: number }> = new EventEmitter(); // EventEmitter para enviar los datos

  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {}

  // Métodos para manejar los eventos táctiles y de ratón
  onTouchStart(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    if (event instanceof MouseEvent) {
      // Es un evento de ratón
      this.updateTouchPosition(event.clientX, event.clientY);
    } else if (event instanceof TouchEvent) {
      // Es un evento de toque
      const touch = event.touches[0];
      this.updateTouchPosition(touch.clientX, touch.clientY);
    }
  }

  onTouchMove(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    if (event instanceof MouseEvent) {
      // Es un evento de ratón
      if (this.touchPosition) {
        this.updateTouchPosition(event.clientX, event.clientY);
      }
    } else if (event instanceof TouchEvent) {
      // Es un evento de toque
      if (this.touchPosition) {
        const touch = event.touches[0];
        this.updateTouchPosition(touch.clientX, touch.clientY);
      }
    }
  }

  updateTouchPosition(clientX: number, clientY: number) {
    const rect = this.touchArea.nativeElement.getBoundingClientRect();
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const relativeX = (x - centerX) / centerX;
    const relativeY = (centerY - y) / centerY;

    if (relativeX ** 2 + relativeY ** 2 <= 1) {
      this.touchPosition = { x, y };

      const pan = Math.round((relativeX + 1) / 2 * 255);
      const tilt = Math.round((relativeY + 1) / 2 * 255);

      this.focoData.emit({ pan, tilt });
    }
  }
}
