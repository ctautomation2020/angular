import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as _moment from 'moment';
import {Apollo} from 'apollo-angular';

@Component({
  selector: 'app-publication-model',
  templateUrl: './publication-model.component.html',
  styleUrls: ['./publication-model.component.scss']
})
export class PublicationModelComponent implements OnInit {
  publicationForm: FormGroup;
  constructor(@Inject(MAT_DIALOG_DATA) public input: any,
              private apollo: Apollo,
              public dialogRef: MatDialogRef<PublicationModelComponent>,
              private fb: FormBuilder) { }
  publishYear: string;
  ngOnInit(): void {
    this.publicationForm = new FormGroup({
      Publication_ID : new FormControl(this.input.publication != null ? this.input.publication.Publication_ID : ''),
      Person_ID: new FormControl(),
      Publication_Type_Ref : new FormControl(this.input.publication != null ?
         this.input.publication.Publication_Type_Ref : '', Validators.required),
      Level_Ref: new FormControl(this.input.publication != null ? this.input.publication.Level_Ref : '', Validators.required),
      Paper_Title: new FormControl(this.input.publication != null ? this.input.publication.Paper_Title : '', Validators.required),
      First_Author: new FormControl(this.input.publication != null ? this.input.publication.First_Author : '', Validators.required),
      Second_Author: new FormControl(this.input.publication != null ? this.input.publication.Second_Author : ''),
      Other_Authors: new FormControl(this.input.publication != null ? this.input.publication.Other_Authors : ''),
      Journal_Name: new FormControl(this.input.publication != null ? this.input.publication.Journal_Name : '', Validators.required),
      Volume: new FormControl(this.input.publication != null ? this.input.publication.Volume : '',
      [Validators.required, Validators.min(1)]),
      Issue: new FormControl(this.input.publication != null ? this.input.publication.Issue : '', [Validators.required, Validators.min(1)]),
      DOI: new FormControl(this.input.publication != null ? this.input.publication.DOI : '', Validators.required),
      Year_Of_Publish: new FormControl(this.input.publication != null ?
        this.input.publication.Year_Of_Publish + '-01-01T18:30:00.000Z' : '', Validators.required),
      Start_Page_No: new FormControl(this.input.publication != null ? this.input.publication.Start_Page_No : ''),
      End_Page_No: new FormControl(this.input.publication != null ? this.input.publication.End_Page_No : ''),
      Publisher: new FormControl(this.input.publication != null ? this.input.publication.Publisher : '', Validators.required),
      Impact_Factor: new FormControl(this.input.publication != null ? this.input.publication.Impact_Factor : '')
    });
  }
  onSubmit(): void {
    const publishYear = new Date(this.publicationForm.value.Year_Of_Publish);
    console.log(publishYear.getFullYear());

    this.publicationForm.value.Year_Of_Publish = publishYear.getFullYear();
    this.dialogRef.close(this.publicationForm.value);
  }

}
