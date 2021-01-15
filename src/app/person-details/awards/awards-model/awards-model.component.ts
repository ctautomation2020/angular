import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';
import { ApolloCache, ApolloClient, InMemoryCache } from '@apollo/client/core';
@Component({
  selector: 'app-awards-model',
  templateUrl: './awards-model.component.html',
  styleUrls: ['./awards-model.component.scss']
})
export class AwardsModelComponent implements OnInit {
  awardForm: FormGroup;
  fileToUpload: any;
  constructor(@Inject(MAT_DIALOG_DATA) public input: any, private apollo: Apollo, public dialogRef: MatDialogRef<AwardsModelComponent>) {
   }

  ngOnInit(): void {
    this.awardForm = new FormGroup({
      Award_ID: new FormControl(this.input.award != null ? this.input.award.Award_ID : ''),
      Person_ID: new FormControl(''),
      Title: new FormControl(this.input.award != null ? this.input.award.Title : '', Validators.required),
      Organization: new FormControl(this.input.award != null ? this.input.award.Organization : '', Validators.required),
      Place: new FormControl(this.input.award != null ? this.input.award.Place : '', Validators.required),
      Start_Year: new FormControl(this.input.award != null ?
         this.input.award.Start_Year + '-01-01T18:30:00.000Z' : '', Validators.required),
      Details: new FormControl(this.input.award != null ? this.input.award.Details : '', Validators.required)
    });
  }
  onSubmit(): void {
    const StartDate = new Date(this.awardForm.value.Start_Year);

    this.awardForm.value.Start_Year = StartDate.getFullYear();
    this.dialogRef.close(this.awardForm.value);
  }
  handleFileInput(event: any): void {
    /*console.log('File Upload');
    this.fileToUpload = event.target.files[0];
    const formData = new FormData();
    formData.append('file', this.fileToUpload);
    const req = gql `
          mutation uploadPersonAward($file: Upload!) {
            uploadPersonAward(file: $file)
          }
          `;
    this.apollo
    .mutate({
      mutation: req,
      variables: {
        file: event.target.files[0]
      },
      context: {
        useMultipart: true
      }
    }).subscribe(({ data }) => {
      console.log(data);
    });*/
  }

}
