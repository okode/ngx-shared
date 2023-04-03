import { Component } from '@angular/core';

@Component({
  selector: 'ngx-shared-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'example-app';

  public throwTestError(): void {
    throw new Error("Sentry Test Error");
  }
}
