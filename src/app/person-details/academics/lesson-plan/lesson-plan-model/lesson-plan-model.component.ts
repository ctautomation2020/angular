import { Component, Inject, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { PersonDetailsService } from 'src/app/person-details/person-details.service';
import { ConfirmBoxComponent } from 'src/app/shared/confirm-box/confirm-box.component';
import { AcademicsService } from '../../academics.service';
import { CourseTopics, LessonPlanQuery } from '../lesson-plan.model';
import { LessonPlanService } from '../lesson-plan.service';
import json from 'json-keys-sort';

import gql from 'graphql-tag';
interface LessonPlan {
  course_code: String
  group_ref: number
  session_ref: number
  actual_date: Date
  lessonPlanPeriods: LessonPlanModel[]
}
interface LessonPlanModel {
  period: number;
  references: Reference[];
  selectedTopics: number[],
  selectedUnits: number[]
}
interface Reference {
  clp_id: number;
  ctopic_id: number;
  topic: string;
  reference: string;
}
@Component({
  selector: 'app-lesson-plan-model',
  templateUrl: './lesson-plan-model.component.html',
  styleUrls: ['./lesson-plan-model.component.scss']
})
export class LessonPlanModelComponent implements OnInit {

  periods = [1, 2, 3 ,4, 5, 6, 7, 8];
  courseTopic: any = [];
  selectedPeriods: any = [];
  originalLessonPlanPeriods: LessonPlanModel[] = [];
  lessonPlanPeriods: LessonPlanModel[] = [];
  lessonPlan: LessonPlan = {
    actual_date: new Date(),
    group_ref: 0,
    session_ref: 0,
    course_code: '',
    lessonPlanPeriods: []
  }
  units: any[] = [];
  rawCourseTopics: CourseTopics[];
  sallot_id: number;
  courseCode: any;
  query: { course_code: any; group_ref: any; session_ref: any; };
  session: any;
  courseTitle: any;
    disabled:any = [];

    constructor(public dialog: MatDialog, private personDetailsService: PersonDetailsService, private academicsService: AcademicsService, private apollo: Apollo, private dateAdapter: DateAdapter<Date>, private activatedRoute: ActivatedRoute, private router: Router, private lessonPlanService: LessonPlanService) {
      this.dateAdapter.setLocale('en-GB');
     }
     deleteTopic(p: LessonPlanModel, t: number) {
      const dialogDeleteRef = this.dialog.open(ConfirmBoxComponent, {data: {message: "Do you want to remove this topic?"}});
      dialogDeleteRef.afterClosed().subscribe((result: any) => {
        if (result) {
          p.selectedTopics = p.selectedTopics.filter((s) => s !== t);
          p.references = p.references.filter((r) => r.ctopic_id != t);
        }
      });
     }
     deletePeriod(p: number) {
      const dialogDeleteRef = this.dialog.open(ConfirmBoxComponent, {data: {message: "Do you want to remove Period " +  p + " ?"}});
      dialogDeleteRef.afterClosed().subscribe((result: any) => {
        if (result) {
          this.selectedPeriods = this.selectedPeriods.filter((s: any) => s !== p);
       this.lessonPlanPeriods = this.lessonPlanPeriods.filter((l) => l.period != p);

        }
      });
     }
     onPeriodChange(event: any) {
      this.selectedPeriods = event;
      for (let p of this.selectedPeriods) {
        if(this.lessonPlanPeriods.filter((l) => l.period == p)[0]) {

        }
        else {
          const newPeriod: any = {
            period: p,
            selectedUnits: [],
            selectedTopics: [],
            references: []
          }
          this.lessonPlanPeriods.push(newPeriod);
        }
      }
    }
    onTopicChange(event: any, selectedTopics: number[], p: LessonPlanModel) {
      for (let t of selectedTopics) {
       if(p.references.filter((r) => r.ctopic_id == t)[0]) {

       }
       else {
        const courseTopic = this.rawCourseTopics.filter((topic: any) => topic.ctopic_id === t )[0];
        const reference: Reference = {
          clp_id: 0,
          ctopic_id: t,
          topic: courseTopic.topic,
          reference: ''
        }
        p.references.push(reference);
       }
      }

    }
    getTopics(units: number[]) {
      let filteredTopics: any = [];
      for (let u of units) {
        const topics = this.courseTopic.filter((unit: any) => unit.unit === u)[0].topics;


        filteredTopics = filteredTopics.concat(topics);
      }
      return filteredTopics;

    }
    setDisabled(){
        this.disabled = ["1"];
    }
    ngOnInit(): void {
        this.setDisabled();
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
          this.academicsService.getCourseTopics(course.course_code).subscribe((courseTopics) => {
          this.rawCourseTopics = courseTopics;
          let modules = groupBy(courseTopics, 'module_num');
          let units: any = [];
          let unitTopics: any = [];
          Object.keys(modules).forEach((key) => {
            units.push(+key);
            const topicList = {
              unit: +key,
              topics: [] as any
            }
            const topics: any = []
            for (let t of modules[key]) {
              const topic = {
                topic: t.topic,
                ctopic_id: t.ctopic_id
              }
              topics.push(topic);
            }
            topicList.topics = topics;
            unitTopics.push(topicList);
          });

          this.units = units;
          this.courseTopic = unitTopics;
          const lessonPlan: LessonPlanQuery[] = this.lessonPlanService.getLessonPlan();
          if (lessonPlan.length != 0) {
            let periods = groupBy(lessonPlan, 'period');
          periods = json.sort(periods, true);
          let lessonPlanModel: LessonPlanModel[] = [];
          let selectedPeriods: any = [];
          Object.keys(periods).forEach((key) => {
            let lessonPlan: LessonPlanModel = {
              period: +key,
              selectedTopics: [],
              selectedUnits: [],
              references: []
            }
            selectedPeriods.push(+key);
            let topics: number[] = [];
            let units: number[] = [];
            let references: Reference[] = [];
            for(let l of periods[key] as LessonPlanQuery[]) {

              topics.push(l.course_ctopic_id);
              let unit = this.rawCourseTopics.filter((c) => c.ctopic_id == l.course_ctopic_id)[0].module_num;
              if(units.indexOf(unit) == -1) {
                units.push(unit);
              }
              let reference: Reference = {
                clp_id: l.clp_id,
                ctopic_id: l.course_ctopic_id,
                topic: l.course_topic.topic,
                reference: l.references
              }
              references.push(reference);
            }
            lessonPlan.selectedTopics = topics;
            lessonPlan.selectedUnits = units;
            lessonPlan.references = references;
            lessonPlanModel.push(lessonPlan);
          });
          this.selectedPeriods = selectedPeriods;
          this.originalLessonPlanPeriods = JSON.parse(JSON.stringify(lessonPlanModel));

          this.lessonPlanPeriods =  JSON.parse(JSON.stringify(lessonPlanModel));
          this.lessonPlan.actual_date = this.getDate(lessonPlan[0].actual_date);
          }
        });
        this.academicsService.getSession(course.session_ref).subscribe((session) => {
          this.session = session[0];
        })
        this.academicsService.getCourse(course.course_code).subscribe((course: any) => {
          this.courseTitle = course.title;
        })
      }
    });
  });

    }
    getDate(inputDate: any): Date {
      const temp = parseFloat(inputDate) / 1000;
      const myDate = new Date(0);
      myDate.setUTCSeconds(temp);
      return myDate;
    }
    addClass() {
    this.lessonPlan.lessonPlanPeriods = this.lessonPlanPeriods;
    console.log(this.originalLessonPlanPeriods);
    const d = new Date(this.lessonPlan.actual_date);
        const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        for (let p of this.lessonPlan.lessonPlanPeriods) {

          for (let t of p.references) {
            let query = {
              course_code: this.query.course_code,
              group_ref: this.query.group_ref,
              session_ref: this.query.session_ref,
              actual_date: date,
              period: p.period,
              course_ctopic_id: t.ctopic_id,
              references: t.reference
            }
            let api: string = "";
            if(this.originalLessonPlanPeriods.length == 0) {
              api = "CREATE";
            }
            else {
              const period = this.originalLessonPlanPeriods.filter((l) => l.period == p.period)[0]
              if (!t.clp_id) {
                api = "CREATE";
              }
              else {
                const topic = period.references.filter((r) => r.ctopic_id == t.ctopic_id)[0];
                if (topic.reference !== t.reference) {
                  api = "UPDATE";
                }
              }
            }
            if (api == "CREATE") {
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
            else if (api == "UPDATE") {
              let query = {
                clp_id: t.clp_id,
                actual_date: date,
                period: p.period,
                course_ctopic_id: t.ctopic_id,
                references: t.reference
              }
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
                data: query
              }
            }).subscribe((data: any) => {
              console.log(data);
            });
            }
            /*

            */
          }
        }
        for (let p of this.originalLessonPlanPeriods) {
          for (let t of p.references) {
            const period = this.lessonPlanPeriods.filter((l) => l.period == p.period)[0];
            let api: string = "";
            if(!period) {
              api = "DELETE";
            }
            else {
              const topic = period.references.filter((r) => r.ctopic_id === t.ctopic_id)[0];
              if(!topic) {
                api = "DELETE";
              }
            }
            if (api === "DELETE") {
              console.log("Delete " + t.topic);
            }
          }
        }
    }
}
