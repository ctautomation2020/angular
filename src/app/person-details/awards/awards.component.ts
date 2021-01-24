import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AwardsModelComponent } from './awards-model/awards-model.component';
import {Apollo, QueryRef} from 'apollo-angular';
import gql from 'graphql-tag';
import {AwardsModel} from './awards.model';
import { PersonDetailsService } from '../person-details.service';
import { ConfirmBoxComponent } from 'src/app/shared/confirm-box/confirm-box.component';
@Component({
  selector: 'app-awards',
  templateUrl: './awards.component.html',
  styleUrls: ['./awards.component.scss']
})
export class AwardsComponent implements OnInit {
  awards: AwardsModel[];
  queryRef: QueryRef<AwardsModel[], any>;
  constructor(public dialog: MatDialog,  private apollo: Apollo, public personDetailsService: PersonDetailsService) { }

  ngOnInit(): void {
    const id = this.personDetailsService.getPersonID();
    const req = gql`
    query personAwards($data: personAwardQueryInput!) {
      personAwards(data: $data) {
        Award_ID
        Person_ID
        Title
        Organization
        Place
        Start_Year
        Details
      }
    }
    `;
    this.queryRef = this.apollo
    .watchQuery({
      query: req,
      variables: {
        data: {
          Person_ID: id
        }
      }
    });
    this.queryRef.valueChanges.subscribe((result: any) => {
      this.awards = JSON.parse(JSON.stringify(result.data.personAwards));
      console.log(this.awards);

    });
  }
  openDialog(id: number): void {
    const award = this.awards.filter((q) => q.Award_ID === id);
    const dialogUpdateRef = this.dialog.open(AwardsModelComponent, {data: {
      award : award[0],
    }  });
    dialogUpdateRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
        const req = gql `
          mutation updatePersonAward($data: awardUpdateInput!) {
            updatePersonAward(data: $data) {
              Award_ID
            }
          }
          `;
        this.apollo
          .mutate({
            mutation: req,
            variables: {
              data: {
                Award_ID: result.Award_ID,
                Title: result.Title,
                Organization: result.Organization,
                Place: result.Place,
                Start_Year: result.Start_Year,
                Details: result.Details
              }
            }
          }).subscribe(({ data }) => {
            this.queryRef.refetch();
          });
      }});

    }
    createDialog(): void {
      const dialogCreateRef = this.dialog.open(AwardsModelComponent, {data: {
      }  });
      dialogCreateRef.afterClosed().subscribe(result => {
        if (result) {
          console.log(result);
          const req = gql `
          mutation createPersonAward($data: awardInput!) {
            createPersonAward(data: $data) {
              Award_ID
            }
          }
          `;
          this.apollo
          .mutate({
            mutation: req,
            variables: {
              data: {
                Title: result.Title,
                Organization: result.Organization,
                Place: result.Place,
                Start_Year: result.Start_Year,
                Details: result.Details
              }
            }
          }).subscribe(({ data }) => {
            this.queryRef.refetch();
          });



        }});


    }
    deleteDialog(id: number): void {
    const dialogDeleteRef = this.dialog.open(ConfirmBoxComponent, {data: {message: "Do you want to delete?"}});
    dialogDeleteRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
        const req = gql `
        mutation deletePersonAward($data: awardDeleteInput!) {
          deletePersonAward(data: $data) {
            Person_ID
          }
        }
        `;
        this.apollo
    .mutate({
      mutation: req,
      variables: {
        data: {
          Award_ID: id
        }
      }}).subscribe(({ data }) => {
      this.queryRef.refetch();
    });

      }
    });
    }

}
