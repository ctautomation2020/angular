import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { MultiSelectService } from './multi-select.service';

@Component({
    selector: 'multi-select',
    templateUrl: './multi-select.component.html',
    styleUrls: ['./multi-select.component.css']
})
export class MultiSelectComponent implements OnInit{

    @Input() placeholder:string;
    @Input() options:any[];
    @Input() display_key:any;
    @Input() output_key:any;
    @Input() disabled:any[];

    @Input() selectModel:any[];
    @Output() selectModelChange = new EventEmitter<any>();

    selected:boolean[] = [];
    selectAll:boolean;
    dropdown:boolean;

    values:any[] = [];
    value_string:string = "";

    constructor(private multiService:MultiSelectService) {
        this.multiService.dropChange.subscribe((data:boolean) => {
            this.dropdown = data;
        })

        this.selectAll = false;
    }
    dropList(value:boolean){
        this.multiService.setDropDown(false);
        this.dropdown = value;
    }
    initSelected(){
        this.selected = [];
        for(let i = 0; i < this.options.length; i++){
            this.selected.push(false);
        }
    }
    getValueString(){
        let str: any = [];

        this.options.forEach((elem, i) => {
            let data = (elem[this.output_key]) ? elem[this.output_key] : elem;
            let disp = (elem[this.display_key]) ? elem[this.display_key] : elem;

            if(this.selectModel.includes(data)){
                str.push(disp);
                if(!this.selected[i]) this.selected[i] = true;
            }
            else{
                if(this.selected[i]) this.selected[i] = false;
            }
        });

        this.value_string = str.join(", ");
    }
    getSelected(){
        this.getValueString();
        return this.value_string;
    }
    updateValues(){
        this.values = [];
        let temp:any;

        this.selected.forEach((elem, i) => {
            if(elem == true){
                temp = this.options[i][this.output_key];

                if(temp == null || temp == undefined) temp = this.options[i];
                this.values.push(temp);
            }
        })

        this.selectModelChange.emit(this.values);
    }
    updateSelected(index:any){
        this.selectAll = false;
        this.selected[index] = !this.selected[index];
        this.updateValues();
    }
    changeAll(value:boolean){
        this.selectAll = value;

        this.selected.forEach((elem,i) => {
            if(!this.checkDisabled(this.options[i]))
                this.selected[i] = value;
        })

        this.updateValues();
    }
    checkDisabled(data:any){
        if(this.disabled == null || this.disabled == undefined || this.disabled.length == 0) return false;
        let opt = (data[this.output_key]) ? data[this.output_key] : data;

        if(this.disabled.includes(opt)) return true;
        return false;
    }
    @HostListener('document:click', ['$event']) onDocumentClick(event: any) {
        this.multiService.setDropDown(false);
    }
    ngOnInit(): void {
        this.initSelected();
    }
    ngOnChanges(){
        if(this.selected.length != this.options.length) {
            this.selectAll = false;
            this.initSelected();
        }
        this.getValueString();
    }
}
