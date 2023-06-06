import { Route } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { RouterPageComponent } from './pages/router-page/router-page.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'router',
    component: RouterPageComponent,
  },
];
