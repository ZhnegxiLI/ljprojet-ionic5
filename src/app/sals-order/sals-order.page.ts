import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Network } from '@ionic-native/network/ngx';
import { AlertController, LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { BaseUI } from 'src/common/baseui';
import { RestService } from '../service/rest.service';

@Component({
  selector: 'app-sals-order',
  templateUrl: './sals-order.page.html',
  styleUrls: ['./sals-order.page.scss'],
})
export class SalsOrderPage extends BaseUI {
  private orderForm: FormGroup;
  listProduct: Array<any>;
  gridShow = false;
  productNotFound = false;
  depts: any;
  readModel = false;
  deptSelect: any;
  orderId = "";
  hadSubmit = false;
  disableDepts = false;
  loading = false;
  validationStaus = 0; // 0:未保存 , 1:已保存未提交, 2:已提交, 3:可审核

  validationContentAction: string;

  constructor(
    private formBuilder: FormBuilder,
    public alerCtrl: AlertController,
    public modalCtrl: ModalController,
    public rest: RestService,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public navCtrl: NavController,
    public storage: Storage,
    public network: Network,
    public router: ActivatedRoute
  ) {

    super();
    this.orderForm = this.formBuilder.group({
      title: [''],
      date: [new Date().toISOString(), Validators.required],
      telSender: [''],
      faxSender: [''],
      sender: [''],
      receiver: [''],
      faxReceiver: [''],
      telReceiver: [''],
      descript: [''],
      dept: ['', Validators.required],
      userId: [''],
      deptId: [''],
      status: [''],
      statusCode: 0,
      messageForAuditor: [''],
      remarkfeedback: [''],
      type: ['O', Validators.required], //'I': 采购 'O': 销售
      seal: [''],
      copyAfterCheck: [false],
      remarkCorrige: [''],
      entrepriseName: [''],
      entrepriseType: ['']
    });
    this.depts = [];
    this.listProduct = new Array<any>();

    this.storage.get("username").then((val) => {
      var temp = this.orderForm.value;
      temp.sender = val;
      this.orderForm.setValue(temp);
    });

    this.storage.get("userId").then((val) => {
      var temp = this.orderForm.value;
      temp.userId = val;
      this.orderForm.setValue(temp);
    });

    this.storage.get("fax").then((val) => {
      var temp = this.orderForm.value;
      temp.faxSender = val;
      this.orderForm.setValue(temp);
    });

    this.storage.get("telephone").then((val) => {
      var temp = this.orderForm.value;
      temp.telSender = val;
      this.orderForm.setValue(temp);
    });

    this.storage.get("entrepriseType").then((val) => {
      var temp = this.orderForm.value;
      temp.entrepriseType = val;
      this.orderForm.setValue(temp);
    });

    if (this.network.type != 'none') {
      this.rest.GetCompanyName()
        .subscribe(
          f => {
            if (f.Success) {
              var temp = this.orderForm.value;
              temp.entrepriseName = f.Data;
              this.orderForm.setValue(temp);
            } else {
              super.showToast(this.toastCtrl, f.Msg);
            }
          },
          error => {
            if (error.Type == '401') {
              // todo migrate to interceptor to handle login expired error
              // super.logout(this.toastCtrl, this.navCtrl);
            } else {
              super.showToast(this.toastCtrl, error.Msg);
            }
          });
    }
    else {
      super.showToast(this.toastCtrl, "您处于离线状态，请连接网络! ");
    }
  }

  ngOnInit() {
  }

  initDepts() {
    if (this.network.type != 'none') {
      this.rest.GetDeptByName(-1) // 填写url的参数
        .subscribe(
          f => {
            if (f.Success) {
              this.depts = f.Data;
              this.storage.set('departmentList', JSON.stringify(f.Data));
            } else {
              super.showToast(this.toastCtrl, f.Msg);
            }
          },
          error => {
            if (error.Type == '401') {
              // todo handle all 401 error in interceptor
              //super.logout(this.toastCtrl, this.navCtrl);
            } else {
              super.showToast(this.toastCtrl, error.Msg);
            }
          });
    }
    else {
      super.showToast(this.toastCtrl, "您处于离线状态，请连接网络! ");

    }
  }


  initOrderInfo(title: string) {
    this.loading = true;
    if (this.network.type != 'none') {
      this.rest.GetSalesOrderByOrderId(title)
        .subscribe(
          (f: any) => {
            if (f.Success) {
              let orderDetail = f.Data.salesOrderDetail;
              let temp = this.orderForm.value;
              this.orderId = orderDetail.commandeId;
              temp.title = orderDetail.commandeId;
              temp.date = orderDetail.commandeCreateDate;
              temp.telSender = orderDetail.senderTelephoneNumber;
              temp.faxSender = orderDetail.senderFax;
              temp.sender = orderDetail.sender;
              temp.receiver = orderDetail.receiver;
              temp.faxReceiver = orderDetail.receiverFax;
              temp.telReceiver = orderDetail.receiverTelephoneNumber;
              temp.descript = orderDetail.Remark1;
              temp.dept = orderDetail.departmentLabel;
              temp.userId = orderDetail.commandCreator;
              temp.deptId = orderDetail.departmentId;
              temp.status = orderDetail.status;
              temp.messageForAuditor = orderDetail.messageForAuditor;
              temp.statusCode = orderDetail.statusCode || 0;
              temp.remarkfeedback = orderDetail.remarkfeedback;
              temp.type = orderDetail.commandeType;
              temp.seal = orderDetail.CachetPo || "";
              temp.copyAfterCheck = orderDetail.CtovPo;
              temp.remarkCorrige = orderDetail.MrmkPo;
              temp.entrepriseName = orderDetail.entrepriseName;
              this.orderForm.setValue(temp);

              this.storage.get('permission').then(p => {
                var permission = JSON.parse(p);
                var hasPermission = false;
                permission.map(p => {
                  if (p.permissionCode == 'OrderModule_financialValidation' || p.permissionCode == 'OrderModule_managerValidation') {
                    hasPermission = true;
                  }
                });
                var status = Number.parseInt(orderDetail.status);
                if (status != 0) {
                  this.hadSubmit = true;
                  this.validationStaus = (hasPermission && (status == 1 || status == 3)) ? 3 : 2;
                  this.validationContentAction = (hasPermission && (status == 1 || status == 3)) ? '审核' : '查看审核';
                }
                else {
                  this.hadSubmit = false;
                  this.validationStaus = 1;
                  this.validationContentAction = "提交审核";
                }
              });

              this.deptSelect = { id: orderDetail.departmentId, name: orderDetail.departmentLabel };

              let productsInfo = f.Data.cargo;
              for (let index = 0; index < productsInfo.length; index++) {
                let productTemp = {
                  idProduct: "",
                  nameProduct: "",
                  adresseProduct: "",
                  nameOffical: "",
                  numberProduct: "",
                  unitProduct: "",
                  priceProduct: "",
                  datePayProduct: "",
                  hadPaidProduct: "",
                  descriptProduct: "",
                  unitPriceType: "",
                  equivalenceValue: ""
                };
                productTemp['idProduct'] = productsInfo[index].cargoId;
                productTemp['nameProduct'] = productsInfo[index].cargoName;
                productTemp['numberProduct'] = productsInfo[index].cargoQuantity || 0;
                productTemp['unitProduct'] = productsInfo[index].cargoUnit;
                productTemp['priceProduct'] = productsInfo[index].cargoUnitPrice || 0;
                productTemp['datePayProduct'] = productsInfo[index].scheduleCargoDate;
                productTemp['unitPriceType'] = productsInfo[index].unitPriceType || '';
                productTemp['adresseProduct'] = productsInfo[index].cargoAdresseProduct || "";
                productTemp['nameOffical'] = productsInfo[index].cargoNameOfiice || "";
                productTemp['hadPaidProduct'] = productsInfo[index].hadPaidProduct || "";;
                productTemp['descriptProduct'] = productsInfo[index].CargoDescripe || "";
                productTemp['totalPrice'] = Number(productsInfo[index].totalPrice).toFixed(2) || 0;
                productTemp['equivalenceValue'] = productsInfo[index].equivalenceValue || 1;
                this.listProduct.push(productTemp);
              }
              if (!this.hadSubmit) {
                this.initDepts();
              }
            } else {
              super.showToast(this.toastCtrl, f.Msg);
            }
            this.loading = false;
          },
          error => {
            this.loading = false;
            if (error.Type == '401') {
              // todo migrate: handle all 401 error in interceptor
              // super.logout(this.toastCtrl, this.navCtrl);
            } else {
              super.showToast(this.toastCtrl, error.Msg);
            }
          }
        );
    }
    else {
      super.showToast(this.toastCtrl, "您处于离线状态，请连接网络! ");
    }
  }

  // changeCopyCheck(event){
  //   if(event.checked){
  //     this.orderForm.controls['copyAfterCheck'].setValue('1');
  //   }else{
  //     this.orderForm.controls['copyAfterCheck'].setValue('0');
  //   }
  // }


  async logForm() {
    console.log(this.orderForm.value);
    if (this.listProduct.length == 0) {
      super.showToast(this.toastCtrl, "请添加货物");
      return;
    }
    let confirm = await this.alerCtrl.create({
      header: '提示',
      message: '确认保存此订单吗?',
      buttons: [
        {
          text: '确认',
          handler: () => {
            this.saveOrder();
          }
        },
        {
          text: '取消',
          handler: () => {
          }
        }
      ]
    });
    confirm.present()
  }

  async saveOrder() {

    var loading = await super.showLoading(this.loadingCtrl, "正在保存，请稍等");
    if (this.network.type != 'none') {
      this.rest.InsertSalesOrderByOrderId(this.orderForm.value, this.listProduct)
        .subscribe(
          f => {
            if (f.Success) {
              super.showToast(this.toastCtrl, "保存成功");
              /*   if(this.readModel){
                  var callback = this.navParams.get('callback');
                  callback(true).then(() => {this.navCtrl.pop();});
                }else{
                  this.navCtrl.setRoot(SalsOrderPage);
                } */
              var orderType;
              if (this.orderForm.value.type == 'O') {
                orderType = { commandTypeId: 'O', commandTypeLabel: '销售' }
              }
              else if (this.orderForm.value.type == 'I') {
                orderType = { commandTypeId: 'I', commandTypeLabel: '采购' }
              }
              this.navCtrl.navigateRoot('ReadSalsOrderCategoriesPage', {
                queryParams: orderType
              });
            } else {
              // alert("保存失敗 : "+f.msg);
              super.showToast(this.toastCtrl, "保存失敗 : " + f.Msg);
            }
            loading.dismiss();
          },
          error => {
            loading.dismiss();
            if (error.Type == '401') {
              // todo migrate to intecptor handle all  error 
              //  super.logout(this.toastCtrl, this.navCtrl);
            } else {
              super.showToast(this.toastCtrl, error.Msg);
            }
          }
        )
    }
    else {
      super.showToast(this.toastCtrl, "您处于离线状态，请连接网络! ");
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SalsOrderPage');
    let title = this.router.snapshot.queryParams['title'];
    if (title != undefined) {
      this.initOrderInfo(title);
      this.readModel = true;
    } else {
      this.storage.get('departmentList').then(p => {
        if (JSON.parse(p) == null || JSON.parse(p).length <= 0) {
          this.initDepts();
        }
        else {
          this.depts = JSON.parse(p);
        }
      });
    }
  }

  presentModal(infoProduct?, index?) {

    let modal;
    if (infoProduct == undefined) {
      if (this.hadSubmit) {
        super.showToast(this.toastCtrl, "订单已提交,不可添加! ");
        return;
      }
      // todo migrate to lazy load modal system
      // modal = this.modalCtrl.create('ProductModelPage');
    } else {
      // todo migrate to lazy load modal system
      // modal = this.modalCtrl.create('ProductModelPage', { infoProduct: infoProduct, hadSubmit: this.hadSubmit });
    }
    modal.onDidDismiss(data => {
      if (index != undefined) {
        if (data != undefined) {
          if (data.action == 1) {
            this.listProduct[index] = data.content;
          } else if (data.action == 0) {
            this.listProduct.splice(index, 1);
          }
        }
      }
      else if (data != undefined) {
        this.listProduct.push(data.content);
      }
    })
    modal.present();
  }

  changeDept() {
    let temp = this.orderForm.value;
    temp.deptId = this.deptSelect.id;
    temp.dept = this.deptSelect.name;
    this.orderForm.setValue(temp);
  }

  valideSalesOrder(validationStaus) {
    var commandeId = this.orderId;
    if (commandeId != null && commandeId != "" && this.readModel) {
      this.navCtrl.navigateForward('ValidationOrderPage',
        {
          queryParams: {
            statusId: this.orderForm.get('status').value,
            commandeId: commandeId,
            validationStaus: validationStaus
          }
        });
    }
  }

  exit() {
    this.modalCtrl.dismiss();
  }

}
