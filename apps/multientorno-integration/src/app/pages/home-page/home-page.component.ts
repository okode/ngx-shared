import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CONFIG } from '../../app.module';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
@Component({
  selector: 'ngx-shared-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
    resultadoEnv = 'No se ha podido seleccionar entorno';

    constructor(@Inject(CONFIG) private readonly config: any){}

    ngOnInit(): void {
      this.resultadoEnv = this.config.env;
    }

}
