import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
interface LessonPlan {
  course_code: String
  group_ref: number
  session_ref: number
  actual_date: String
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
    actual_date: '',
    period: 0,
    references: '',
    course_ctopic_id: 0,
  }
  constructor(@Inject(MAT_DIALOG_DATA) public input: any, public dialogRef: MatDialogRef<LessonPlanModelComponent>) { }

  ngOnInit(): void {
    console.log(this.input);
    if(this.input) {
      this.lessonPlan.course_code = this.input.query.course_code;
    this.lessonPlan.group_ref = this.input.query.group_ref;
    this.lessonPlan.session_ref = this.input.query.session_ref;
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
