import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as _moment from 'moment';
import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';
import { EducationModel } from '../education.model';

@Component({
  selector: 'app-education-model',
  templateUrl: './education-model.component.html',
  styleUrls: ['./education-model.component.scss']
})
export class EducationModelComponent implements OnInit {
  educationForm: FormGroup;
  // tslint:disable-next-line: max-line-length
  constructor(@Inject(MAT_DIALOG_DATA) public input: any, private apollo: Apollo, public dialogRef: MatDialogRef<EducationModelComponent>) { }
  startYear: string;
  endYear: string;
  ngOnInit(): void {
    this.educationForm = new FormGroup({
      Qualification_ID: new FormControl(this.input.qualification != null ? this.input.qualification.Qualification_ID : ''),
      Institution: new FormControl(this.input.qualification != null ? this.input.qualification.Institution : '', Validators.required),
      University: new FormControl(this.input.qualification != null ? this.input.qualification.University : '', Validators.required),
      Thesis_Title: new FormControl(this.input.qualification != null ? this.input.qualification.Thesis_Title : ''),
      Specialization: new FormControl(this.input.qualification != null ? this.input.qualification.Specialization : ''),
      Faculty_Research: new FormControl(this.input.qualification != null ? this.input.qualification.Faculty_Research : ''),
      Start_Date: new FormControl(this.input.qualification != null ?
         this.input.qualification.Start_Date + '-01-01T18:30:00.000Z' : '', Validators.required),
      End_Date: new FormControl(this.input.qualification != null ?
         this.input.qualification.End_Date + '-01-01T18:30:00.000Z' : '', Validators.required),
      Person_ID: new FormControl(),
      Qualification_Level_Ref: new FormControl(this.input.qualification != null ?
        this.input.qualification.Qualification_Level_Ref : '', Validators.required),
      Degree_Ref: new FormControl(this.input.qualification != null ?
        this.input.qualification.Degree_Ref : '', Validators.required),
      Branch_Ref: new FormControl(this.input.qualification != null ? this.input.qualification.Branch_Ref : '', Validators.required),
      Class_Obtained_Ref: new FormControl(this.input.qualification != null ?
        this.input.qualification.Class_Obtained_Ref : '', Validators.required)
    });
    console.log(this.educationForm.value);
  }
  onSubmit(): void {
    const StartDate = new Date(this.educationForm.value.Start_Date);
    const EndDate = new Date(this.educationForm.value.End_Date);

    this.educationForm.value.Start_Date = StartDate.getFullYear();
    this.educationForm.value.End_Date = EndDate.getFullYear();
    console.log(this.educationForm.value)
    this.dialogRef.close(this.educationForm.value);
  }

}
