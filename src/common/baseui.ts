

import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { promise } from 'protractor';

export abstract class BaseUI {
    constructor() {

    }
    protected async showLoading(loadingCtrl: LoadingController, message: string): Promise<HTMLIonLoadingElement> {
        let loader = await loadingCtrl.create(
            {
                message: message
            }
        );
        loader.present();
        return loader;
    }

    protected async showToast(toastCtrl: ToastController, message: string): Promise<HTMLIonToastElement> {
        let toast = await toastCtrl.create({
            message: message,
            duration: 2000,
            position: 'bottom'
        });
        toast.present();
        return toast;
    }

    protected async showAlert(alertCtrl: AlertController,title,message, callback, callbackReturn){
        let confirm = await alertCtrl.create({
            header: title,
            message: message,
            buttons: [
              {
                text: '确认',
                handler:()=>{callback} 
              },
              {
                text: '取消',
                handler: callbackReturn
              }
            ]
          });
          confirm.present();
    }
} 
