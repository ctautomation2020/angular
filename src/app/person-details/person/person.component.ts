import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import {Apollo, QueryRef} from 'apollo-angular';
import gql from 'graphql-tag';
import { PersonModelComponent } from './person-model/person-model.component';
import { PersonModel } from './person.model';
import {PersonDetailsService} from '../person-details.service';
import { map } from 'rxjs/operators';
import { PersonReferenceModel } from '../person-reference.model';

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss', '../person-details.component.scss'],

})

export class PersonComponent implements OnInit {
  prefix: PersonReferenceModel[];
  community: PersonReferenceModel[];
  caste: PersonReferenceModel[];
  maritalStatus: PersonReferenceModel[];
  gender: PersonReferenceModel[];
  person: PersonModel;
  queryRef: QueryRef<PersonModel, any>;
  constructor(private router: Router, private activatedRoute: ActivatedRoute,
              private apollo: Apollo, public dialog: MatDialog, public personDetailsService: PersonDetailsService) { }

  ngOnInit(): void {
    console.log(localStorage.getItem('Person_ID'));
    const req = gql`
    query person {
      person {
        Person_ID
        Prefix_Ref
        First_Name
        Last_Name
        DOB
        Gender_Ref
        Community_Ref

        Marital_Status_Ref
        Caste
        Primary_MailID
        Secondary_MailID
        Aadhar_Card
        PAN_Card
        Passport_Number
        Primary_ContactNumber
        Secondary_ContactNumber
        Intercom_Number
        Alias_Name
        Address_Line1
        Address_Line2
        Address_Line3
        Address_Line4
        Room_Num
      }
    }
    `;
    this.queryRef = this.apollo
      .watchQuery<PersonModel>({
        query: req
      });
    this.queryRef.valueChanges.subscribe(((result: any) => {
        this.person = JSON.parse(JSON.stringify(result.data.person));
        console.log(this.person);
        if (this.person.DOB) {
          const temp = parseFloat(result.data.person.DOB) / 1000;
          const myDate = new Date(0);
          myDate.setUTCSeconds(temp);
          this.person.DOB = myDate ;
        }
      }));

    this.personDetailsService.getDropDown('Gender').subscribe(result => {
      this.gender = result;
    });
    this.personDetailsService.getDropDown('Prefix').subscribe(result => {
      this.prefix = result;
    });
    this.personDetailsService.getDropDown('Community').subscribe(result => {
      this.community = result;
    });
    this.personDetailsService.getDropDown('Marital_Status').subscribe(result => {
      this.maritalStatus = result;
    });
    }

onOpenModel(): void {

  const dialogRef = this.dialog.open(PersonModelComponent, { data: {
    person: this.person,
    gender: this.gender,
    prefix: this.prefix,
    community: this.community,
    maritalStatus: this.maritalStatus
  }} );
  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      const d = new Date(result.DOB);
      const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      console.log(result,date);
      const req = gql `
    mutation updatePerson($data: updatePersonInput!) {
      updatePerson(data: $data) {
        Person_ID
        Marital_Status_Ref
      }
    }
    `;
      this.apollo
    .mutate({
      mutation: req,
      variables: {
        data: {
          Person_ID: this.personDetailsService.getPersonID() ,
          Prefix_Ref: result.Prefix_Ref,
          PAN_Card: result.PAN_Card,
          First_Name: result.First_Name,
          Last_Name: result.Last_Name,
          Caste: result.Caste,
          Gender_Ref: result.Gender_Ref,
          Marital_Status_Ref: result.Marital_Status_Ref,
          Community_Ref: result.Community_Ref,
          Primary_MailID: result.Primary_MailID,
          Secondary_MailID: result.Secondary_MailID,
          Aadhar_Card: result.Aadhar_Card,
          Passport_Number: result.Passport_Number,
         DOB: date,
          Primary_ContactNumber: result.Primary_ContactNumber,
          Secondary_ContactNumber: result.Secondary_ContactNumber,
          Intercom_Number: result.Intercom_Number,
          Alias_Name: result.Alias_Name,
          Address_Line1: result.Address_Line1,
          Address_Line2: result.Address_Line2,
          Address_Line3: result.Address_Line3,
          Address_Line4: result.Address_Line4,
          Room_Num: result.Room_Num
        }
      }
    }).subscribe(({ data }) => {
      this.queryRef.refetch();
    });


    }
  });

}

filterPrefix(): PersonReferenceModel {
  return this.prefix.filter(l => l.Ref_Code === this.person.Prefix_Ref)[0];
}
filterGender(): PersonReferenceModel {
  return this.gender.filter(l => l.Ref_Code === this.person.Gender_Ref)[0];
}
filterStatus(): PersonReferenceModel {
  return this.maritalStatus.filter(l => l.Ref_Code === this.person.Marital_Status_Ref)[0];
}
filterCommunity(): PersonReferenceModel {
  return this.community.filter(l => l.Ref_Code === this.person.Community_Ref)[0];
}
}
