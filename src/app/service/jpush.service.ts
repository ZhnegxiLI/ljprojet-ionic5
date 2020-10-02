import { Injectable } from '@angular/core';
import { JPush } from '@jiguang-ionic/jpush/ngx';

@Injectable({
  providedIn: 'root'
})
export class JpushService {

  constructor(
    public jPush: JPush) 
    { }

 
}
