import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  adminPermission: boolean = false;
  username: string;
  financialPermission: boolean = false;
  managerPermission: boolean = false;

  constructor(public navCtrl: NavController,
    public storage: Storage,
    public plt: Platform) { }

  ngOnInit() {

    this.storage.get('username').then(p => this.username = p);
    this.storage.get('userId').then(p => this.adminPermission = p == 'Admi' ? true : false);
    this.storage.get('permission').then(p => {
      var permission = JSON.parse(p);

      if (permission != null && permission.length > 0) {
        permission.forEach(val => {
          if (val.permissionCode == 'OrderModule_financialValidation') {
            this.financialPermission = true;
          }
          if (val.permissionCode == 'OrderModule_managerValidation') {
            this.managerPermission = true;
          }
        });
      }
    });
  }


  async logout() {

    await this.storage.remove("userId");
    await this.storage.remove("token");
    if (this.plt.is("cordova")) {
      // todo migrate to new jpush service
      // this.jpush.cleanTags();
      // console.log('already logout');
      // this.jpush.getAllTags();
    }
    this.navCtrl.navigateRoot('LoginPage');
  }

  newFunctionality() {
    this.navCtrl.navigateRoot('NewFunctionalityPage');
  }
  showSalesOrder() {
    this.navCtrl.navigateRoot('ReadSalsOrderCategoriesPage', {
      queryParams: {
        commandTypeLabel: '销售',
        commandTypeId: 'O'
      }
    });
  }
  showPurcharseOrder() {
    this.navCtrl.navigateRoot('ReadSalsOrderCategoriesPage', {
      queryParams: {
        commandTypeLabel: '采购',
        commandTypeId: 'I'
      }
    });
  }
  editOrder() {
    this.navCtrl.navigateRoot('SalsOrderPage');
  }
  valideOrder() {
    this.navCtrl.navigateRoot('ValidationOrderListPage');
  }

  myInfo() {
    this.navCtrl.navigateRoot('MyInfoPage');
  }
  setPermission() {
    this.navCtrl.navigateRoot('SetPermissionPage');
  }
  viewCommandWithFilterPage() {
    this.navCtrl.navigateRoot('ViewCommandWithFilterPage');
  }

}
