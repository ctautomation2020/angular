import { Component, OnInit } from '@angular/core';
import { ExperienceModel } from './experience.model';

import { PersonDetailsService } from '../person-details.service';
import { MatDialog } from '@angular/material/dialog';
import {Apollo, QueryRef} from 'apollo-angular';
import gql from 'graphql-tag';
import { ExperienceModelComponent } from './experience-model/experience-model.component';
import { PersonReferenceModel } from '../person-reference.model';
import { ConfirmBoxComponent } from 'src/app/shared/confirm-box/confirm-box.component';
@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss']
})
export class ExperienceComponent implements OnInit {
  experiences: ExperienceModel[];
  designation: PersonReferenceModel[];
  empCategory: PersonReferenceModel[];
  workNature: PersonReferenceModel[];

  queryRef: QueryRef<ExperienceModel[], any>;
  constructor(public dialog: MatDialog, private apollo: Apollo,  private personDetailsService: PersonDetailsService) { }

  ngOnInit(): void {
    const id = this.personDetailsService.getPersonID();
    const req = gql`
    query person_experiences($data: PersonQueryInput) {
      person_experiences(data: $data) {
        Experience_ID
        Person_ID
        Designation_Ref
        Organization
        Department
        Start_Date
        End_Date
        Emp_Category_Ref
        Work_Nature_Ref
        Position_Held
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
      console.log(result.data);
      this.experiences = result.data.person_experiences;

    });
    this.personDetailsService.getDropDown('Designation').subscribe(result => {
      this.designation = result;
    });
    this.personDetailsService.getDropDown('Emp_Category').subscribe(result => {
      this.empCategory = result;
    });
    this.personDetailsService.getDropDown('Work Nature').subscribe(result => {
      this.workNature = result;
    });
  }
  openDialog(id: number): void {
    const experience = this.experiences.filter((q) => q.Experience_ID === id);
    const dialogUpdateRef = this.dialog.open(ExperienceModelComponent, {data: {
      designation: this.designation,
      workNature: this.workNature,
      empCategory: this.empCategory,
      experience: experience[0]
    }});
    dialogUpdateRef.afterClosed().subscribe(result => {
      if (result) {
        const req = gql`
        mutation updatePersonExperience($data: experienceUpdateInput!) {
          updatePersonExperience(data: $data) {
            Experience_ID
          }
        }
        `;
        this.apollo.mutate({
          mutation: req,
          variables: {
            data: {
              Experience_ID: result.Experience_ID,

              Designation_Ref: result.Designation_Ref,
              Organization: result.Organization,
              Department: result.Department,
              Start_Date: result.Start_Date,
              End_Date: result.End_Date,
              Emp_Category_Ref: result.Emp_Category_Ref,
              Work_Nature_Ref: result.Work_Nature_Ref,
              Position_Held: result.Position_Held
            }
          }
        }).subscribe(({data}) => {
          this.queryRef.refetch();
        });
      }
    });
  }
  createDialog(): void {
    const dialogCreateRef = this.dialog.open(ExperienceModelComponent, {data: {
      designation: this.designation,
      workNature: this.workNature,
      empCategory: this.empCategory
    }});
    dialogCreateRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
        const req = gql`
        mutation createPersonExperience($data: experienceInput!) {
          createPersonExperience(data: $data) {
            Person_ID
          }
        }
        `;
        this.apollo.mutate({
          mutation: req,
          variables: {
            data: {
              Designation_Ref: result.Designation_Ref,
              Organization: result.Organization,
              Department: result.Department,
              Start_Date: this.getDate(result.Start_Date),
              End_Date: this.getDate(result.End_Date),
              Emp_Category_Ref: result.Emp_Category_Ref,
              Work_Nature_Ref: result.Work_Nature_Ref,
              Position_Held: result.Position_Held
            }
          }
        }).subscribe(({data}) => {
          this.queryRef.refetch();
        })
      }
    });
  }
  getDate(newDate: any): Date {
     const d = new Date(newDate);
    // const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
     return d;
  }
  deleteDialog(id: number): void {
    const dialogDeleteRef = this.dialog.open(ConfirmBoxComponent, {data: {message: "Do you want to delete?"}});
    dialogDeleteRef.afterClosed().subscribe(result => {
      if(result) {
        console.log(result);
        const req = gql `
        mutation deletePersonExperience($data: experienceDeleteInput!) {
          deletePersonExperience(data: $data) {
            Person_ID
          }
        }
        `;
        this.apollo
    .mutate({
      mutation: req,
      variables: {
        data: {
          Experience_ID: id
        }
      }}).subscribe(({ data }) => {
      this.queryRef.refetch();
    });

      }
    });
  }
  filterDesignation(ref: number): PersonReferenceModel {
    return this.designation.filter(l => l.Reference_ID === ref)[0];
  }
  filterEmpCategory(ref: number): PersonReferenceModel {
    return this.empCategory.filter(l => l.Reference_ID === ref)[0];
  }
  filterWorkNature(ref: number): PersonReferenceModel {
    return this.workNature.filter(l => l.Reference_ID === ref)[0];
  }

}
