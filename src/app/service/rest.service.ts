import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { environment } from 'src/environments/environment';
import { UtilsService } from './utils.service';
import { Observable, throwError } from 'rxjs';
import { timeout, catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  token: string;

  constructor(
    public http: HttpClient,
    public storage: Storage,
    public utils: UtilsService
  ) { 

    this.loadToken();
  }

  async loadToken(){
    this.token = await this.utils.getKey('token');
  }

  private host = environment.SERVER_API_URL;

  private apiUrlGetCargoByName = this.host + 'api/cargo/GetCargo';
  private apiUrlGetOrdersByUserId = this.host + 'api/SalesOrder/GetSalesOrderByUserId';
  private apiUrlGetSalesOrderCategoriesByUserId = this.host + 'api/SalesOrder/GetSalesOrderCategoriesByUserId';
  private apiUrlGetDeptByName = this.host + 'api/Client';
  private apiUrlGetSalesOrderByOrderId = this.host + "api/SalesOrder/GetSalesOrderByOrderId";
  private apiUrlInsertSalesOrderByOrderId = this.host + "api/SalesOrder/InsertSalesOrderByOrderId";
  private apiUrlgetUserList = this.host + "api/Auth/getUserList";
  private apiUrlLogin = this.host + "api/Auth/Login";
  private apiUrlUpdateSalesOrderStatut = this.host + "api/SalesOrder/UpdateSalesOrderStatut";
  private apiUrlCheckAvailabilityOfToken = this.host + "api/Auth/CheckAvailabilityOfToken";
  private apiUrlGetSalesOrderValidationContent = this.host + 'api/SalesOrder/GetSalesOrderValidationContent';
  private apiUrlGetCompanyName = this.host + 'api/Version/GetCompanyName';
  private apiUrlGetSalesOrderValidationList = this.host + 'api/SalesOrder/GetSalesOrderValidationList';
  private apiUrlGetUnitList = this.host + 'api/cargo/GetUnitList';

  private apiUrlGetPermissionList = this.host + 'api/Permission/GetPermissionList';
  private apiUrlGetUserPermissionById = this.host + 'api/Permission/GetUserPermissionById';
  private apiUrlSaveUserPermission = this.host + 'api/Permission/SaveUserPermission';

  private apiUrlAdvancedSalesOrderSearch = this.host + "api/SalesOrder/AdvancedSalesOrderSearch";
  /*
  * With auth services 
  */

  SaveUserPermission(UserPermissionParam: object): Observable<any> {
    return this.postUrlReturn(this.apiUrlSaveUserPermission, UserPermissionParam);
  }
  GetCargoByName(limit: number): Observable<any> {
    return this.getUrlReturn(this.apiUrlGetCargoByName + "?limit=" + limit);
  }

  GetPermissionList(): Observable<any> {
    return this.getUrlReturn(this.apiUrlGetPermissionList);
  }
  GetUserPermissionById(userId: string): Observable<any> {
    return this.getUrlReturn(this.apiUrlGetUserPermissionById + '?userId=' + userId);
  }

  GetSalesOrderValidationList(categoryId: number, type: string): Observable<any> {
    return this.postUrlReturn(this.apiUrlGetSalesOrderValidationList, { categoryId: categoryId, type: type });
  }

  AdvancedSalesOrderSearch(criteria: object): Observable<any> {
    return this.postUrlReturn(this.apiUrlAdvancedSalesOrderSearch, criteria);
  }

  GetUnitList(): Observable<any> {
    return this.getUrlReturn(this.apiUrlGetUnitList);
  }

  GetSalesOrderValidationContent(orderId: string): Observable<any> {
    return this.getUrlReturn(this.apiUrlGetSalesOrderValidationContent + "?orderId=" + orderId);
  }

  GetOrdersByUserId(userId: string, categoryId: string, type: string, step: number, begin: number): Observable<any> {
    return this.getUrlReturn(this.apiUrlGetOrdersByUserId + "?userId=" + userId + "&categoryId=" + categoryId + "&type=" + type + "&step=" + step + "&begin=" + begin);
  }

  GetSalesOrderCategoriesByUserId(userId: string, type: string): Observable<any> {
    return this.getUrlReturn(this.apiUrlGetSalesOrderCategoriesByUserId + "?userId=" + userId + "&type=" + type);
  }

  GetDeptByName(limit: number): Observable<any> {
    return this.getUrlReturn(this.apiUrlGetDeptByName + "?limit=" + limit);
  }

  GetSalesOrderByOrderId(orderId: string): Observable<any> {
    return this.getUrlReturn(this.apiUrlGetSalesOrderByOrderId + "?orderId=" + orderId);
  }

  InsertSalesOrderByOrderId(orderInfo, products: Array<any>): Observable<any> {
    return this.postUrlReturn(this.apiUrlInsertSalesOrderByOrderId, { orderInfo: orderInfo, products: products });
  }
  UpdateSalesOrderStatut(userId, orderId, applicationContent, statusCode): Observable<any> {
    return this.postUrlReturn(this.apiUrlUpdateSalesOrderStatut, { userId: userId, applicationContent: applicationContent, orderId: orderId, statutCode: statusCode });
  }

  GetCompanyName(): Observable<any> {
    return this.getUrlReturn(this.apiUrlGetCompanyName);
  }


  CheckAvailabilityOfToken(token : string ):Observable<any> {
    return this.getUrlReturn(this.apiUrlCheckAvailabilityOfToken+"?token="+token);
  }
  
  /**
   * Without auth
   * 
   * @param {*} User
   * @returns {Observable<any>}
   * @memberof RestProvider
   */
  Login(User): Observable<any> {
    return this.postUrlReturnWithOutAuth(this.apiUrlLogin, User);
  }
  /**
   * Without auth
   * Get userlist for the login page 
   * @returns {Observable<any>}
   * @memberof RestProvider
   */
  GetUserList(): Observable<any> {
    return this.getUrlReturnWithOutAuth(this.apiUrlgetUserList);
  }



  // TODO: Login page remove all 
  private getUrlReturnWithOutAuth(url: string): Observable<any> {
    return this.http.get(url).pipe(timeout(environment.waitingTime), catchError(this.handleError));
  }


  private  getUrlReturn(url: string): Observable<any> {
   
    const headers = new HttpHeaders().set("Authorization", this.token).set("Content-Type", "application/json");
    return this.http.get(url, {
      headers: headers
    }).pipe(timeout(environment.waitingTime), catchError(this.handleError));
  }

  private postUrlReturn(url: string, body: any): Observable<any> {
    const headers = new HttpHeaders().set("Authorization", this.token).set("Content-Type", "application/json");
    return this.http.post(url, body, {
      headers: headers
    }).pipe(timeout(environment.waitingTime), catchError(this.handleError));
  }

  private postUrlReturnWithOutAuth(url: string, body: any): Observable<any> {
    return this.http.post(url, body).pipe(timeout(environment.waitingTime), catchError(this.handleError));
  }

  private handleError(error: Response | any) {
    // TODO migrate to newer http error handler
    let errMsg: string;
    // if (error instanceof Response) {
    //   const body = error.json() || '';
    //   const err = body.error || JSON.stringify(body);
    //   errMsg = `${error.status}-${error.statusText || ''} ${err}`;
    // }
    // else {
    //   errMsg = error.message ? error.message : error.tostring();
    // }
    // console.error(errMsg);
    // return Observable.throw(errMsg);
    if (error.name != null && error.name == "TimeoutError") {
      //超时信息
      return Observable.throw({ Msg: "连接超时请检查网络连接", Success: false });
    }
    else {

      console.error(JSON.parse(error._body));
      return Observable.throw(JSON.parse(error._body));
    }
  }
  


}
