import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(public storage: Storage) { }

  async getKey(key: string): Promise<string> {
    return await this.storage.get(key).catch(() => { return });
  }

  async checkIsLogined(): Promise<boolean> {

    var jwt = await this.getKey('jwt');
    var userId = await this.getKey('userId');
    return jwt != null && userId != null;
  }
}
