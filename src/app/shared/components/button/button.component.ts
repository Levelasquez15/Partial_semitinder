import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  standalone: false
})
export class ButtonComponent {
  @Input() type: string = 'button';
  @Input() expand: string = 'block';
  @Input() color: string = 'primary';
  @Input() disabled: boolean = false;
  @Input() label: string = '';

  @Output() clicked = new EventEmitter<void>();

  onClick() {
    this.clicked.emit();
  }
}
