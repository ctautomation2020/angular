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

import json from 'json-keys-sort';
import { LessonPlan, LessonPlanGroup, LessonPlanQuery } from './lesson-plan.model';
import { LessonPlanService } from './lesson-plan.service';


@Component({
  selector: 'app-lesson-plan',
  templateUrl: './lesson-plan.component.html',
  styleUrls: ['./lesson-plan.component.scss']
})

export class LessonPlanComponent implements OnInit {
  lessonPlanGroup: LessonPlanGroup[];
  sallot_id: number;
  session: AcademicsModel;
  courseTitle: string;
  courseCode: string;
  personName: any;
  Prefix_Ref: any;
  Prefix: any;
  lessonPlan: LessonPlanQuery[];
  courseTopics: any;
  queryRef: QueryRef<LessonPlan[], any>
  query: { course_code: any; group_ref: any; session_ref: any; };
  constructor(public dialog: MatDialog, private personDetailsService: PersonDetailsService, private academicsService: AcademicsService, private apollo: Apollo, private activatedRoute: ActivatedRoute, private router: Router, private dateAdapter: DateAdapter<Date>, public lessonPlanService: LessonPlanService) {
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
          var groupByName: any;
                const groupBy = (array: any, key: any) => {
                  // Return the end result
                  return array.reduce((result: any, currentValue: any) => {
                    // If an array already present for key, push it to the array. Else create an array and push the object
                    (result[currentValue[key]] = result[currentValue[key]] || []).push(
                      currentValue
                    );
                    // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
                    return result;
                  }, {}); // empty object is the initial value for result object
                };
                let dates = groupBy(result.data.course_lessonplan, 'actual_date');
                dates = json.sort(dates, true);
                let lessonPlan: LessonPlanGroup[] = [];
                Object.keys(dates).forEach(function(key) {
                  let lesson: LessonPlanGroup = {
                    actual_date: key,
                    hours: dates[key].length,
                    topics: [] as any
                  }
                  let topics = [] as any;
                  for (let t of dates[key]) {
                    let topic: any = t.course_topic.topic;
                    topics.push(topic);
                  }
                  topics = topics.filter((v: string,i: number) => topics.indexOf(v) == i)
                  lesson.topics = topics;
                  lessonPlan.push(lesson);
                });
                console.log(lessonPlan);
                this.lessonPlanGroup = lessonPlan;
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
  deleteDialog(l: any) {
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
  openDialog(date: string) {
    const lessonPlan: LessonPlanQuery[] = this.lessonPlan.filter((l) => l.actual_date === date);
    this.lessonPlanService.setLessonPlan(lessonPlan);
    this.router.navigate(['/person-details', 'academics', 'lesson-plan', 'lesson-plan-model', this.sallot_id]);
  
  }
  onAddClass() {
    this.lessonPlanService.setLessonPlan([]);
    this.router.navigate(['/person-details', 'academics', 'lesson-plan', 'lesson-plan-model', this.sallot_id]);
  }
}
