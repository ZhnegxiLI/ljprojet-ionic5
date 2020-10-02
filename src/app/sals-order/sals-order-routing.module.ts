import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalsOrderPage } from './sals-order.page';

const routes: Routes = [
  {
    path: '',
    component: SalsOrderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalsOrderPageRoutingModule {}
