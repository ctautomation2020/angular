import { Component, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EducationModelComponent } from './education-model/education-model.component';
import {Apollo, QueryRef} from 'apollo-angular';
import gql from 'graphql-tag';
import {EducationModel} from './education.model';
import { PersonDetailsService } from '../person-details.service';
import { PersonReferenceModel } from '../person-reference.model';
import { ConfirmBoxComponent } from 'src/app/shared/confirm-box/confirm-box.component';
@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.scss', '../person-details.component.scss']
})
export class EducationComponent implements OnInit {
  qualifications: EducationModel[];
  queryRef: QueryRef<EducationModel[], any>;
  degree: PersonReferenceModel[];
  branch: PersonReferenceModel[];
  classObtained: PersonReferenceModel[];
  qualificationLevel: PersonReferenceModel[];

  constructor(public dialog: MatDialog,  private apollo: Apollo, public personDetailsService: PersonDetailsService) {  }

  ngOnInit(): void {
    const id = this.personDetailsService.getPersonID();
    const req = gql`
    query personQualifications($data: Person_QualificationsInputQuery) {
      personQualifications(data: $data) {
        Qualification_ID
        Person_ID
        Branch_Ref
        Degree_Ref
        Class_Obtained_Ref
        Qualification_Level_Ref
        Institution
        University
        Start_Date
        End_Date
        Thesis_Title
        Faculty_Research
        Specialization
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
        this.qualifications = JSON.parse(JSON.stringify(result.data.personQualifications));

      });
    this.personDetailsService.getDropDown('Degree').subscribe(result => {
      this.degree = result;
    });
    this.personDetailsService.getDropDown('Branch').subscribe(result => {
      this.branch = result;
    });
    this.personDetailsService.getDropDown('Class_Obtained').subscribe(result => {
      this.classObtained = result;
    });
    this.personDetailsService.getDropDown('Qualification_Level').subscribe(result => {
      this.qualificationLevel = result;
    });

  }
  openDialog(id: number): void {
    const qualification = this.qualifications.filter((q) => q.Qualification_ID === id);
    console.log(qualification);
    const dialogUpdateRef = this.dialog.open(EducationModelComponent, {data: {
      qualification : qualification[0],
      degree: this.degree,
      branch: this.branch,
      classObtained: this.classObtained,
      qualificationLevel: this.qualificationLevel
    }  });
    dialogUpdateRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
        const req = gql `
    mutation updatePersonQualification($data: Person_QualificationUpdateInput!) {
      updatePersonQualification(data: $data) {
        Qualification_ID
        Institution
        University
        Thesis_Title
        Specialization
        Faculty_Research
      }
    }
    `;
        this.apollo
    .mutate({
      mutation: req,
      variables: {
        data: {
        Qualification_ID: result.Qualification_ID,
        Institution: result.Institution,
        Start_Date: result.Start_Date,
        End_Date: result.End_Date,
        University: result.University,
        Thesis_Title: result.Thesis_Title,
        Specialization: result.Specialization,
        Faculty_Research: result.Faculty_Research,
        Branch_Ref: result.Branch_Ref,
        Degree_Ref: result.Degree_Ref,
        Class_Obtained_Ref: result.Class_Obtained_Ref,
        Qualification_Level_Ref: result.Qualification_Level_Ref
        }
      }
    }).subscribe(({ data }) => {
      this.queryRef.refetch();
    });
      }
    });
  }
  createDialog(): void{
    const dialogCreateRef = this.dialog.open(EducationModelComponent, {data: {
      degree: this.degree,
      branch: this.branch,
      classObtained: this.classObtained,
      qualificationLevel: this.qualificationLevel
    }  });
    dialogCreateRef.afterClosed().subscribe(result => {
      if (result) {
        const req = gql `
    mutation createPersonQualification($data: Person_QualificationInput!) {
      createPersonQualification(data: $data) {
        Institution
        University
        Thesis_Title
        Specialization
        Faculty_Research
      }
    }
    `;
        this.apollo
    .mutate({
      mutation: req,
      variables: {
        data: {
        Person_ID: this.personDetailsService.getPersonID(),
        Institution: result.Institution,
        University: result.University,
        Start_Date: result.Start_Date,
        End_Date: result.End_Date,
        Thesis_Title: result.Thesis_Title,
        Specialization: result.Specialization,
        Faculty_Research: result.Faculty_Research,
        Branch_Ref: result.Branch_Ref,
        Degree_Ref: result.Degree_Ref,
        Class_Obtained_Ref: result.Class_Obtained_Ref,
        Qualification_Level_Ref: result.Qualification_Level_Ref
        }
      }
    }).subscribe(({ data }) => {
      this.queryRef.refetch();
    });

      }
    });

  }
  deleteDialog(id: number): void {
    const dialogDeleteRef = this.dialog.open(ConfirmBoxComponent, {data: {message: "Do you want to delete?"}});
    dialogDeleteRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
        const req = gql `
        mutation deletePersonQualification($data: Qualification_InputQuery!) {
          deletePersonQualification(data: $data) {
            Person_ID
          }
        }
        `;
        this.apollo
    .mutate({
      mutation: req,
      variables: {
        data: {
          Qualification_ID: id
        }
      }}).subscribe(({ data }) => {
      this.queryRef.refetch();
    });

      }
    });
  }
  filterQualificationLevel(ref: number): PersonReferenceModel {
    return this.qualificationLevel.filter(l => l.Ref_Code === ref)[0];
  }
  filterDegree(ref: number): PersonReferenceModel {
    return this.degree.filter(l => l.Ref_Code === ref)[0];
  }
  filterBranch(ref: number): PersonReferenceModel {
    return this.branch.filter(l => l.Ref_Code === ref)[0];
  }
  filterClassObtained(ref: number): PersonReferenceModel {
    return this.classObtained.filter(l => l.Ref_Code === ref)[0];
  }
}
