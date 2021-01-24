import { Component, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { PersonDetailsService } from '../../person-details.service';
import { AcademicsModel } from '../academics.model';
import { AcademicsService } from '../academics.service';
import { LessonPlanModelComponent } from './lesson-plan-model/lesson-plan-model.component';
interface LessonPlan {
  actual_date: Date,
  period: number,
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
              actual_date
              period
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
  onAddClass() {
    const dialogCreateRef = this.dialog.open(LessonPlanModelComponent, {data: {
      courseTopics: this.courseTopics,
      query: this.query,
      lessonPlan: this.lessonPlan
    }});
    dialogCreateRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
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
            data: result
          }
        }).subscribe(({data}) => {
          this.queryRef.refetch();
        });
      }
    });
  }
}
