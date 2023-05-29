import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CONFIG } from '../../app.module';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { EnvironmentVars } from 'apps/multientorno-integration/src/environments/environment-vars.model';
@Component({
  selector: 'ngx-shared-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
    resultadoEnv = 'nada'

    constructor(@Inject(CONFIG) private readonly config: EnvironmentVars){}

    ngOnInit(): void {
      this.resultadoEnv = this.config.env;
    }

}
