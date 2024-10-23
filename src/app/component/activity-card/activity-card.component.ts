import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-activity-card',
  templateUrl: './activity-card.component.html',
  styleUrls: ['./activity-card.component.scss']
})
export class ActivityCardComponent {
  @Input() loading: boolean = false;
  @Input() status?: boolean;
  @Input() module: string = '';
  @Input() count: number = 0;
}
