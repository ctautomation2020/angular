import { Component, Inject, OnInit } from '@angular/core';

import {Apollo} from 'apollo-angular';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ExperienceModel } from '../experience.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
@Component({
  selector: 'app-experience-model',
  templateUrl: './experience-model.component.html',
  styleUrls: ['./experience-model.component.scss']
})
export class ExperienceModelComponent implements OnInit {

  experienceForm: FormGroup;
  // tslint:disable-next-line: max-line-length
  constructor(@Inject(MAT_DIALOG_DATA) public input: any, private apollo: Apollo, public dialogRef: MatDialogRef<ExperienceModelComponent>, private dateAdapter: DateAdapter<Date>) {
    this.dateAdapter.setLocale('en-GB'); }
  getDate(inputDate: any): Date {
    const temp = parseFloat(inputDate) / 1000;
    const myDate = new Date(0);
    myDate.setUTCSeconds(temp);
    return myDate;
  }
  ngOnInit(): void {
    this.experienceForm = new FormGroup({
      Experience_ID: new FormControl(this.input.experience != null ? this.input.experience.Experience_ID : ''),
      Person_ID: new FormControl(),
      Designation_Ref: new FormControl(this.input.experience != null ? this.input.experience.Designation_Ref : '', Validators.required),
      Organization: new FormControl(this.input.experience != null ? this.input.experience.Organization : '', Validators.required),
      Department: new FormControl(this.input.experience != null ? this.input.experience.Department : '', Validators.required),
      Start_Date: new FormControl(this.input.experience != null ? this.getDate(this.input.experience.Start_Date) : '', Validators.required),
      End_Date: new FormControl(this.input.experience != null ? this.getDate(this.input.experience.End_Date) : '', Validators.required),
      Emp_Category_Ref: new FormControl(this.input.experience != null ? this.input.experience.Emp_Category_Ref : '', Validators.required),
      Work_Nature_Ref: new FormControl(this.input.experience != null ? this.input.experience.Work_Nature_Ref : '', Validators.required),
      Position_Held: new FormControl(this.input.experience != null ? this.input.experience.Position_Held : ''),
    });
  }
  onSubmit(): void {
    this.dialogRef.close(this.experienceForm.value);
  }

}
