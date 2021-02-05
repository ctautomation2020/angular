import { Component, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { ConfirmBoxComponent } from 'src/app/shared/confirm-box/confirm-box.component';
import { PersonDetailsService } from '../../person-details.service';
import { AcademicsModel } from '../academics.model';
import { AcademicsService } from '../academics.service';
import { LessonPlanModelComponent } from './lesson-plan-model/lesson-plan-model.component';
interface LessonPlan {
  clp_id: number;
  actual_date: Date,
  period: number,
  course_ctopic_id: number,
  course_topic: {
    topic: string
  }
  references: string
}
@Component({
  selector: 'app-lesson-plan',
  templateUrl: './lesson-plan.component.html',
  styleUrls: ['./lesson-plan.component.scss']
})

export class LessonPlanComponent implements OnInit {
  sallot_id: number;
  session: AcademicsModel;
  courseTitle: string;
  courseCode: string;
  personName: any;
  Prefix_Ref: any;
  Prefix: any;
  lessonPlan: LessonPlan[];
  courseTopics: any;
  queryRef: QueryRef<LessonPlan[], any>
  query: { course_code: any; group_ref: any; session_ref: any; };
  constructor(public dialog: MatDialog, private personDetailsService: PersonDetailsService, private academicsService: AcademicsService, private apollo: Apollo, private activatedRoute: ActivatedRoute, private router: Router, private dateAdapter: DateAdapter<Date>) {
    this.dateAdapter.setLocale('en-GB');
   }
  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.sallot_id = +params['sallot_id'];
      const query = {
        sallot_id : this.sallot_id
      }
      this.academicsService.getCourseDetails(query).subscribe((course) => {
        if(course == null) {
          this.router.navigate(['/person-details', 'academics']);
        }
        else {
          const query = {
            course_code : course.course_code,
            group_ref: course.group_ref,
            session_ref: course.session_ref
          }
          this.courseCode = course.course_code;
          this.query = query;
          this.getStaffDetails();
          const req = gql`
          query course_lessonplan($data: course_lessonplanQueryInput!) {
            course_lessonplan(data: $data) {
              clp_id
              actual_date
              period
              course_ctopic_id
              course_topic {
                topic
              }
              references
            }
            }
          `;
          this.queryRef =  this.apollo.watchQuery({
            query: req,
            variables: {
              data: query
            },
            fetchPolicy: 'no-cache'
          })
          this.queryRef.valueChanges.subscribe((result: any) => {
          this.lessonPlan = JSON.parse(JSON.stringify(result.data.course_lessonplan))
          });
          ;
          this.academicsService.getCourseTopics(course.course_code).subscribe((course_topics) => {
            this.courseTopics = course_topics;
            console.log(this.courseTopics);
          })
          this.academicsService.getSession(course.session_ref).subscribe((session) => {
            this.session = session[0];
          })
          this.academicsService.getCourse(course.course_code).subscribe((course: any) => {
            this.courseTitle = course.title;
          })

        }

      })
    })

  }
  getStaffDetails() {
    const req = gql`
    query person {
      person {
        Person_ID
        Prefix_Ref
        First_Name
      }
    }
    `;
    this.apollo
      .watchQuery({
        query: req
      }).valueChanges.subscribe(((result: any) => {
        result = JSON.parse(JSON.stringify(result.data.person));
        console.log(result);
        this.personName = result.First_Name
        this.Prefix_Ref = result.Prefix_Ref
        this.personDetailsService.getDropDown('Prefix').subscribe(result => {
          const id = result.filter((r: any) => r.Reference_ID === this.Prefix_Ref)[0].Ref_Name;
          this.Prefix = id;
          console.log(result);
         });
      }));

  }
  deleteDialog(l: LessonPlan) {
    const dialogDeleteRef = this.dialog.open(ConfirmBoxComponent, {data: {message: "Do you want to delete?"}});
    dialogDeleteRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
        const req = gql `
        mutation delete_course_lessonplan($data: delete_course_lessonplanInput!) {
          delete_course_lessonplan(data: $data) {
            clp_id
          }
        }
        `;
        this.apollo
    .mutate({
      mutation: req,
      variables: {
        data: {
          clp_id: l.clp_id
        }
      }}).subscribe(({ data }) => {
      this.queryRef.refetch();
    });

      }
    });
  }
  openDialog(l: LessonPlan) {
    let dialogUpdateRef = this.dialog.open(LessonPlanModelComponent, {data: {
      courseTopics: this.courseTopics,
      query: this.query,
      lessonPlan: this.lessonPlan,
      lesson: l
    }});
    dialogUpdateRef.afterClosed().subscribe((result) => {
      if(result) {
        console.log(result);
        const req = gql`
        mutation update_course_lessonplan($data: update_course_lessonplanInput!) {
          update_course_lessonplan(data: $data) {
            clp_id
          }
        }
        `;
        this.apollo.mutate({
          mutation: req,
          variables: {
            data: {
              clp_id: l.clp_id,
              actual_date: result.actual_date,
              period: result.period,
              course_ctopic_id: result.course_ctopic_id,
              references: result.references
            }
          }
        }).subscribe(({data}) => {
          this.queryRef.refetch();
        });
      }
    })
  }
  onAddClass() {
    const dialogCreateRef = this.dialog.open(LessonPlanModelComponent, {data: {
      courseTopics: this.courseTopics,
      query: this.query,
      lessonPlan: this.lessonPlan
    }});
    dialogCreateRef.afterClosed().subscribe(lessonPlanPeriods => {
      if (lessonPlanPeriods) {
        for (let p of lessonPlanPeriods) {

          for (let t of p.references) {
            const query = {
              course_code: this.query.course_code,
              group_ref: this.query.group_ref,
              session_ref: this.query.session_ref,
              actual_date: new Date().toISOString(),
              period: p.period,
              course_ctopic_id: t.ctopic_id,
              references: t.reference
            }
            console.log(query);
            const req = gql`
            mutation create_course_lessonplan($data: create_course_lessonplanInput!) {
              create_course_lessonplan(data: $data) {
                clp_id
              }
            }
            `;
            this.apollo.mutate({
              mutation: req,
              variables: {
                data: query
              }
            }).subscribe((data: any) => {
              console.log(data);
            });
          }
        }
      }
    });
  }
}
