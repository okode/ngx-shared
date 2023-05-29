import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CONFIG } from '../../app.module';
@Component({
  selector: 'ngx-shared-router-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [],
  templateUrl: './router-page.component.html',
  styleUrls: ['./router-page.component.scss'],
})
export class RouterPageComponent  {
    

}
