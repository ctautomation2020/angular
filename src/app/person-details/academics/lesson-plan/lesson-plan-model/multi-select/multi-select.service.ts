import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MultiSelectService {

    dropdown:boolean = false;
    dropChange = new EventEmitter<boolean>();

    constructor() { }

    getDropDown(){
        return this.dropdown;
    }
    setDropDown(value:boolean){
        this.dropdown = value;
        this.dropChange.emit(this.dropdown);
    }
}
