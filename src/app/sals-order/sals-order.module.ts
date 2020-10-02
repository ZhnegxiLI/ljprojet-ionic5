import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalsOrderPageRoutingModule } from './sals-order-routing.module';

import { SalsOrderPage } from './sals-order.page';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SalsOrderPageRoutingModule,
    IonicSelectableModule
  ],
  declarations: [SalsOrderPage]
})
export class SalsOrderPageModule {}
