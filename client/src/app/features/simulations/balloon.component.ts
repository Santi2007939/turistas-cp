import { Component, Input } from '@angular/core';

/** Contest balloon icon, tinted with the problem's color. */
@Component({
  selector: 'app-balloon',
  standalone: true,
  template: `
    <svg [attr.width]="size" [attr.height]="size * 1.5" viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 44 C 18 50, 23 53, 19 60" fill="none" stroke="#8C7B70" stroke-width="1.2" />
      <ellipse cx="20" cy="20" rx="16" ry="19" [attr.fill]="color" />
      <path d="M17 38 L23 38 L20 44 Z" [attr.fill]="color" />
      <ellipse cx="13" cy="12" rx="4" ry="6" fill="#FFFFFF" opacity="0.35" />
      @if (letter) {
        <text x="20" y="25" text-anchor="middle" font-size="14" font-weight="700" fill="#FFFFFF"
          style="font-family: system-ui, sans-serif;">{{ letter }}</text>
      }
    </svg>
  `
})
export class BalloonComponent {
  @Input() color = '#E53935';
  @Input() letter = '';
  @Input() size = 28;
}
