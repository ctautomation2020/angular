import { Component, Inject, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
interface LessonPlan {
  course_code: String
  group_ref: number
  session_ref: number
  actual_date: Date
  period: number
  course_ctopic_id: number
  references: String
}
@Component({
  selector: 'app-lesson-plan-model',
  templateUrl: './lesson-plan-model.component.html',
  styleUrls: ['./lesson-plan-model.component.scss']
})
export class LessonPlanModelComponent implements OnInit {
  hours = [1, 2, 3 ,4, 5, 6, 7, 8];
  courseTopic: any = [];
  lessonPlan: LessonPlan = {
    course_code: '',
    session_ref: 0,
    group_ref: 0,
    actual_date: new Date(),
    period: 0,
    references: '',
    course_ctopic_id: 0,
  }
  constructor(@Inject(MAT_DIALOG_DATA) public input: any, public dialogRef: MatDialogRef<LessonPlanModelComponent>, private dateAdapter: DateAdapter<Date>) {
    this.dateAdapter.setLocale('en-GB');
   }
  getDate(inputDate: any): Date {
    const temp = parseFloat(inputDate) / 1000;
    const myDate = new Date(0);
    myDate.setUTCSeconds(temp);
    return myDate;
  }
  ngOnInit(): void {
    console.log(this.input);
    if(this.input) {
      this.lessonPlan.course_code = this.input.query.course_code;
    this.lessonPlan.group_ref = this.input.query.group_ref;
    this.lessonPlan.session_ref = this.input.query.session_ref;
    }
    if (this.input.lesson) {
      console.log(this.getDate(this.input.lesson.actual_date));
      this.lessonPlan.actual_date = this.getDate(this.input.lesson.actual_date);
      this.lessonPlan.period = this.input.lesson.period;
      this.lessonPlan.references = this.input.lesson.references;
      this.lessonPlan.course_ctopic_id = this.input.lesson.course_ctopic_id;
    }
   }
  checkDisabled(topic: string) {
    if (this.input.lessonPlan.filter((l: any) => l.course_topic.topic === topic)[0]) {
      return true;
    }
    return false;

  }
  onSubmit() {
    this.dialogRef.close(this.lessonPlan);
  }
}
