import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, NavController, Platform, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { BaseUI } from 'src/common/baseui';
import { RestService } from '../service/rest.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Network } from '@ionic-native/network/ngx';
import { environment } from 'src/environments/environment';
import { forkJoin, Observable } from 'rxjs';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage extends BaseUI {


  userList: any[] = [];
  selectedUserId: string;
  password: string;
  hasLogUserList: boolean = true;
  valided: boolean = false;
  versionCode: string;
  Environment: string = environment.LABEL;

  constructor(
    public navCtrl: NavController,
    public network: Network,
    public rest: RestService,
    public toastCtrl: ToastController,
    public storage: Storage,
    public loadingCtrl: LoadingController,
    // public jpush : JpushProvider,
    public plt: Platform,
    public appVersion: AppVersion,
    public modalCtrl: ModalController) {
    super();
  }

  ngOnInit() {
  }
  ionViewDidEnter() {
    if (this.plt.is('cordova')) {
      this.appVersion.getVersionCode().then(p => this.versionCode = p.toString());
    }

    var userId;
    var token;
    var loading = super.showLoading(this.loadingCtrl, "加载中...");
    Promise.all([this.storage.get("userId"), this.storage.get("token")]).then(values => {
      userId = values[0];
      token = values[1];

      if (userId != null && token != null) {
        if (this.network.type != 'none') {
          this.rest.CheckAvailabilityOfToken(token).subscribe(
            (f: any) => {
              if (f.Success) {
                this.navCtrl.navigateRoot('SettingsPage');
              }
              else {
                super.showToast(this.toastCtrl, "账号密码已过期，请重新登陆");
                this.loadUserList(loading);
              }
            },
            error => {
              super.showToast(this.toastCtrl, "账号密码已过期，请重新登陆");
              this.storage.remove("userId");
              this.storage.remove("token");
              this.loadUserList(loading);
            }
          )
        }
        else {
          super.showToast(this.toastCtrl, "您处于离线状态，请连接网络!");
        }
      }
      else {
        this.loadUserList(loading);
      }

    });
  }

  loadUserList(loading) {
    if (this.network.type != 'none') {
      forkJoin([this.rest.GetUserList(), this.rest.GetUnitList()])
        .subscribe((f: any) => {
          if (f[0].Success && f[1].Success) {
            this.userList = f[0].Data;
            this.storage.set('unitList', JSON.stringify(f[1].Data));
          } else {
            super.showToast(this.toastCtrl, f.Msg);
          }
          if (this.userList.length != 0) {
            this.hasLogUserList = false;
          } else {
            super.showToast(this.toastCtrl, "用户名获取失败或单位获取失败");
          }
          loading.dismiss();
        },
          error => {
            loading.dismiss();
            super.showToast(this.toastCtrl, error.Msg);
            //alert(error);//TODO remove
          });
    }
    else {
      super.showToast(this.toastCtrl, "您处于离线状态，请连接网络!");
      loading.dismiss();
    }
  }

  async login() {
    if (this.network.type != 'none') {
      if (this.selectedUserId != null && this.password != null && this.selectedUserId != '' && this.password != '') {
        var userTosend = this.userList.filter(p => p.id == this.selectedUserId);
        var user = {};
        if (userTosend != null && userTosend[0] != null) {
          user["Password"] = this.password;
          user["Id"] = userTosend[0].id;
          user["Username"] = userTosend[0].username;
          var loading = await super.showLoading(this.loadingCtrl, "请稍等");
          this.rest.Login(user) // 填写url的参数
            .subscribe(
              (f: any) => {
                loading.dismiss();
                if (f["Success"] == true) {
                  if (this.plt.is("cordova")) {
                    // todo migrate to new jpush service
                    // this.jpush.initJpush();
                    // var tags = [userTosend[0].id];
                    // for (let index = 0; index < f["Data"].permission.length; index++) {
                    //   tags.push(f["Data"].permission[index]['permissionCode']);
                    // }
                    // this.jpush.setTags(tags);
                    // console.log('already login');
                    // this.jpush.getAllTags();
                  }
                  // clean all data before insert
                  this.storage.clear();
                  this.storage.set('userList', JSON.stringify(this.userList));
                  this.storage.set("userId", userTosend[0].id);
                  this.storage.set("username", userTosend[0].username);
                  this.storage.set("token", f["Data"].token);
                  this.storage.set("permission", JSON.stringify(f["Data"].permission));

                  var pemisson = f["Data"].permission.find(i => i.permissionCode == 'OrderModule_financialValidation' || i.permissionCode == 'OrderModule_managerValidation')
                  if (pemisson == null) {
                    document.getElementById('审核销售/采购订单').style.display = 'none';
                  }

                  if (f["Data"].entrepriseType != null) {
                    this.storage.set("entrepriseType", f["Data"].entrepriseType);
                  }
                  if (f["Data"].accountInfo != null) {
                    f["Data"].accountInfo.entrepriseFax != null ? this.storage.set("fax", f["Data"].accountInfo.entrepriseFax) : null;
                    f["Data"].accountInfo.entrepriseTel != null ? this.storage.set("telephone", f["Data"].accountInfo.entrepriseTel) : null;
                    f["Data"].accountInfo.entrepriseName != null ? this.storage.set("entrepriseName", f["Data"].accountInfo.entrepriseName) : null;
                  }
                  this.navCtrl.navigateRoot('SettingsPage');
                }
                else {
                  super.showToast(this.toastCtrl, "登录失败，请检查用户名与密码是否正确");
                }
              },
              error => {
                super.showToast(this.toastCtrl, error.Msg);
              });
        }
        else {
          super.showToast(this.toastCtrl, "请输入正确的账号及密码");
        }
      }
    }
    else {
      super.showToast(this.toastCtrl, "您处于离线状态，请连接网络!");
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

}
