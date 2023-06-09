import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SentryErrorReporterService } from '@okode/ngx-sentry';
@Component({
  selector: 'ngx-shared-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {

  constructor(private sentryService: SentryErrorReporterService) { }

  ngOnInit(): void {
    this.sentryService.setUserScope({ id: 'new-user1'})
  }

  public throwTestError(): void {
    throw new Error("Sentry Test Error");
  }
}
