import { Component, OnInit } from '@angular/core';
import {AreaHitService} from "../../services/area-hit.service";
import {PointRequest} from "../../model/PointRequest";
import {CanvasService} from "../../services/canvas.service";
import {MultiSelectModule} from 'primeng/multiselect';
import {SliderModule} from 'primeng/slider';
import * as $ from 'jquery';
import {first} from "rxjs";

@Component({
  selector: 'app-area-hit-form',
  templateUrl: './area-hit-form.component.html',
  styleUrls: ['./area-hit-form.component.scss']
})
export class AreaHitFormComponent implements OnInit {
  pointRequest: PointRequest = new PointRequest();
  message:string = '';
  xValues: number[];
  rValues: number[];


  constructor(private areaHitService:AreaHitService, private canvasService: CanvasService) {
    this.xValues = [
      -3, -2, -1, 0, 1, 2, 3, 4, 5
    ];
    this.rValues = [
      -3, -2, -1, 0, 1, 2, 3, 4, 5
    ];
  }

  ngOnInit(): void {
    const service = this.canvasService;
    const canvas_new = document.querySelector('canvas');
    this.areaHitService.collectionChange.pipe(first())
      .subscribe((data:any)=>{
        if (canvas_new!=null){
          service.setCanvas(canvas_new);
        }else{
          console.log("Canvas не найден");
        }
      });
    this.canvasService.customObservable.subscribe((message) => {
        this.showErrorMessage(message);
      }
    );
    this.pointRequest.y = 0;
    this.areaHitService.getPoints();
  }

  setX(x:number){}

  setR(r:number){}

  // lastX:string|undefined;
  setY(y:string){
    this.pointRequest.y = Number(y);
  }

  selectX(value: string){
    if (value == "default") {
      this.pointRequest.x = undefined;
    }else this.pointRequest.x = Number(value);
  }

  lastR:string|undefined;

  selectR(value: string){
    if (value == "default"){
      this.pointRequest.r = undefined;
      this.canvasService.unloadR();
    }
    else {
      const r = Number(value);
      this.pointRequest.r = r;
      this.canvasService.loadR(r);
    }
  }

  keyPressNumbersWithDecimal(event:KeyboardEvent):boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31 && (charCode != 45 && this.pointRequest.y) //todo
      && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    //this.pointRequest.y = Number(String.fromCharCode(charCode));
    return true;
  }

  addPoint(){
    if(this.pointIsCorrect()){
      this.areaHitService.addPoint(this.pointRequest);
    }
  }

  pointIsCorrect():boolean{

    const x = this.pointRequest.x;
    let y = this.pointRequest.y;
    if (y){
      try {
        y = Number(this.pointRequest.y);
      }catch (e){
        this.showErrorMessage("Y должен быть в числом");
        return false;
      }
    }
    const r = this.pointRequest.r;

    this.pointRequest.y = y;

    if(x===undefined || y===undefined || r===undefined){
      this.showErrorMessage("Все поля обязательны");
      return false;
    }else{
      if (x>=-3 && x<=5 && y>=-3 && y<=5 && r>=-3 && r<=5){
        this.hideErrorMessage();
        return true;
      }else{
        this.showErrorMessage("Y должен быть в интервале от -3 до 5 включительно");
        return false;
      }
    }
  }

  showErrorMessage(message:string){
    this.message = message;
  }

  hasErrorMessage():boolean{
    return this.message.length > 0;
  }

  hideErrorMessage(){
    this.message = "";
  }

  clearPoints(){
    this.areaHitService.deletePoints();
  }

  getPoints(){
    return this.areaHitService.collection;
  }
}
