import { Component, Inject, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
interface LessonPlan {
  course_code: String
  group_ref: number
  session_ref: number
  actual_date: Date
  periods: Period[]
}
interface Period {
  period: number;
  units: Unit[];
}
interface Unit {
  unit: number;
  topic: Topic[]
}
interface Topic {
  ctopic_id: number
  references: String
}
interface LessonPlanModel {
  period: number;
  references: Reference[];
  selectedTopics: [],
  selectedUnits: []
}
interface Reference {
  ctopic_id: number;
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
  selectedPeriods: any [];
  lessonPlan: LessonPlan = {
    course_code: '',
    session_ref: 0,
    group_ref: 0,
    actual_date: new Date(),
    periods: []
  }
  lessonPlanPeriods: LessonPlanModel[] = [];
  units: any[] = [];
  rawCourseTopics: any;
  constructor(@Inject(MAT_DIALOG_DATA) public input: any, public dialogRef: MatDialogRef<LessonPlanModelComponent>, private dateAdapter: DateAdapter<Date>) {
    this.dateAdapter.setLocale('en-GB');
   }
   onPeriodChange(event: any) {
    this.lessonPlanPeriods = [];
    this.selectedPeriods = event;
    let periods: any = [];
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
  onUnitChange(event: any, p: number) {
    const period = this.lessonPlan.periods.filter((period) => period.period == p )[0];
    period.units = []
    for (let u of event) {
      const unit: any = {
        unit: u,
        topics: []
      }
      period.units.push(unit);
    }

  }
  onTopicChange(event: any, selectedTopics: [], p: any) {
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
  getUnits(units: Unit[]) {
    let selectedUnits = []
    for (let u of units) {
      selectedUnits.push(u.unit);
    }
    return selectedUnits;
  }
  getTopics(units: Unit[]) {
    let filteredTopics: any = [];
    for (let u of units) {
      const topics = this.courseTopic.filter((unit: any) => unit.unit === u)[0].topics;


      filteredTopics = filteredTopics.concat(topics);
    }
    return filteredTopics;

  }
  getDate(inputDate: any): Date {
    const temp = parseFloat(inputDate) / 1000;
    const myDate = new Date(0);
    myDate.setUTCSeconds(temp);
    return myDate;
  }
  ngOnInit(): void {
    const courseTopics = this.input.courseTopics;
    this.rawCourseTopics = courseTopics;
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

          let modules = groupBy(courseTopics, 'module_num');
          let units: any = [];
          let unitTopics: any = [];
          Object.keys(modules).forEach((key) => {
            units.push(key);
            const topicList = {
              unit: key,
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

    if(this.input) {
      this.lessonPlan.course_code = this.input.query.course_code;
    this.lessonPlan.group_ref = this.input.query.group_ref;
    this.lessonPlan.session_ref = this.input.query.session_ref;
    }
    if (this.input.lesson) {
      this.lessonPlan.actual_date = this.getDate(this.input.lesson.actual_date);
    }
   }
  checkDisabled(topic: string) {
    if (this.input.lessonPlan.filter((l: any) => l.course_topic.topic === topic)[0]) {
      return true;
    }
    return false;

  }
  onSubmit() {
    console.log(this.lessonPlan);
    console.log(this.lessonPlanPeriods);


    this.dialogRef.close(this.lessonPlanPeriods);
  }
}
