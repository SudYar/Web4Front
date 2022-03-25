import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from "@angular/common/http";
import {AreaHitResponse} from "../model/AreaHitResponse";
import {PointRequest} from "../model/PointRequest";
import {Router} from "@angular/router";
import {Subject} from "rxjs";
import {CookieService} from "ngx-cookie-service";


@Injectable({
  providedIn: 'root'
})

export class AreaHitService {
  private _collection:Array<AreaHitResponse> = new Array<AreaHitResponse>();
  private _collectionChange:Subject<any> = new Subject();
  private serverLink:string = "http://localhost:21470";

  constructor(private  http: HttpClient, private router: Router, private cookieService: CookieService) {}

  private goToLogin(){
    this.router.navigate(['/login']);

  }

  get collectionChange(): Subject<any> {
    return this._collectionChange;
  }

  public logout(){
    this.cookieService.delete("token");
    this.collection = [];
    this.goToLogin();
  }

  public deletePoints(){
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.cookieService.get("token"));
    headers = headers.append('Access-Control-Allow-Origin', '*');
    // @ts-ignore
    this.http.delete( this.serverLink.concat("/app/clear"), { headers: headers , observe: "response"})
    .subscribe((response) => {
      // @ts-ignore
      this._collection = <Array<AreaHitResponse>>(response.body);
      this.collectionChange.next(true);
    }, error => {
      console.log(error.status);
      if(error.status===403){
        this.goToLogin();
      }
    });
  }

  public addPoint(point: PointRequest){
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.cookieService.get("token"));
    headers = headers.append('Access-Control-Allow-Origin', '*');
    this.http.post( this.serverLink.concat("/app/hit"), point, { headers: headers , observe: "response"})
      .subscribe((response) => {
      // @ts-ignore
      this.collection.push(<AreaHitResponse>(response.body));
      this.collectionChange.next(true);
    }, error => {
      console.log(error.statusText);
      if(error.status===403){
        this.goToLogin();
      }
    });
  }

  public getPoints(){
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + this.cookieService.get("token"));
    headers = headers.append('Access-Control-Allow-Origin', '*');

    this.http.get(this.serverLink.concat("/app/points"), {
      headers: headers,
      observe: "response"
    })
      .subscribe(
      (response) => {
      // @ts-ignore
      this.collection = <Array<AreaHitResponse>>response.body;
      this.collectionChange.next(true);
    }, error => {
      console.log(error.status);
      if (error.status === 403) {
        this.goToLogin();
      }
    });
  }



  get collection(): Array<AreaHitResponse> {
    return this._collection;
  }

  set collection(value: Array<AreaHitResponse>) {
    this._collection = value;
  }
}
