import { query } from '@angular/animations';
import { Component, Inject, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { PersonDetailsService } from 'src/app/person-details/person-details.service';
import { AcademicsService } from '../../academics.service';
import { CourseTopics, LessonPlan, LessonPlanModel, LessonPlanQuery, Reference } from '../lesson-plan.model';
import { LessonPlanService } from '../lesson-plan.service';
import json from 'json-keys-sort';
@Component({
  selector: 'app-lesson-plan-create',
  templateUrl: './lesson-plan-create.component.html',
  styleUrls: ['./lesson-plan-create.component.scss']
})
export class LessonPlanCreateComponent implements OnInit {

  periods = [1, 2, 3 ,4, 5, 6, 7, 8];
  courseTopic: any = [];
  selectedPeriods: any = [];
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
  constructor(private personDetailsService: PersonDetailsService, private academicsService: AcademicsService, private apollo: Apollo, private dateAdapter: DateAdapter<Date>, private activatedRoute: ActivatedRoute, private router: Router, private lessonPlanService: LessonPlanService) {
    this.dateAdapter.setLocale('en-GB');
   }

   onPeriodChange(event: any) {
    this.lessonPlanPeriods = [];
    this.selectedPeriods = event;
    for (let p of this.selectedPeriods) {
      const newPeriod: any = {
        period: p,
        selectedUnits: [],
        selectedTopics: [],
        references: []
      }
      this.lessonPlanPeriods.push(newPeriod);
    }
  }
  onTopicChange(event: any, selectedTopics: number[], p: any) {
    console.log(this.courseTopic);
    p.references = [];
    for (let t of selectedTopics) {
      const courseTopic = this.rawCourseTopics.filter((topic: any) => topic.ctopic_id === t )[0];
      console.log(courseTopic);
      const reference = {
        ctopic_id: t,
        reference: ''
      }
      p.references.push(reference);
    }

  }
  getTopicName(t: number) {
    return this.rawCourseTopics.filter((c: any)=> c.ctopic_id === t)[0].topic;
  }
  getTopics(units: number[]) {
    let filteredTopics: any = [];
    for (let u of units) {
      const topics = this.courseTopic.filter((unit: any) => unit.unit === u)[0].topics;


      filteredTopics = filteredTopics.concat(topics);
    }
    return filteredTopics;

  }
  ngOnInit(): void {
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
          console.log(this.courseTopic);
          const lessonPlan: LessonPlanQuery[] = this.lessonPlanService.getLessonPlan();
          console.log(lessonPlan);
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
            console.log(this.rawCourseTopics);
            for(let l of periods[key] as LessonPlanQuery[]) {

              topics.push(l.course_ctopic_id);
              let unit = this.rawCourseTopics.filter((c) => c.ctopic_id == l.course_ctopic_id)[0].module_num;
              console.log(unit);
              if(units.indexOf(unit) == -1) {
                units.push(unit);
              }
              let reference: Reference = {
                ctopic_id: l.course_ctopic_id,
                reference: l.references
              }
              console.log(reference);
              references.push(reference);
            }
            lessonPlan.selectedTopics = topics;
            lessonPlan.selectedUnits = units;
            lessonPlan.references = references;
            lessonPlanModel.push(lessonPlan);
          });
          this.selectedPeriods = selectedPeriods;
          this.lessonPlanPeriods = lessonPlanModel;
          console.log(this.selectedPeriods);
          this.lessonPlan.actual_date = this.getDate(lessonPlan[0].actual_date);
          }
          })
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
  onSubmit() {
    console.log(this.lessonPlan);
    this.lessonPlan.lessonPlanPeriods = this.lessonPlanPeriods;
  }

}
