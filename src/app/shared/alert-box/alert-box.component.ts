import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-alert-box',
  templateUrl: './alert-box.component.html',
  styleUrls: ['./alert-box.component.scss']
})
export class AlertBoxComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public input: any, public dialogRef: MatDialogRef<AlertBoxComponent>) { }

  ngOnInit(): void {
  }

}
