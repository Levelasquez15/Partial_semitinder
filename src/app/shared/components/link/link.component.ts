import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.scss'],
  standalone: false
})
export class LinkComponent {
  @Input() text: string = '';
  @Input() href?: string;
  @Input() routerLink?: string | any[];

  @Output() clicked = new EventEmitter<void>();

  onClick(event: Event) {
    event.preventDefault();
    this.clicked.emit();
  }
}
