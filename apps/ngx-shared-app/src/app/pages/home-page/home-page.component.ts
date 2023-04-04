import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'ngx-shared-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {

  public throwTestError(): void {
    throw new Error("Sentry Test Error");
  }
}
