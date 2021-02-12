import { Injectable } from '@angular/core';
import { LessonPlan, LessonPlanModel, LessonPlanQuery } from './lesson-plan.model';


@Injectable({
  providedIn: 'root'
})
export class LessonPlanService {
  lessonPlan: LessonPlanQuery[] = [];
  constructor() { }

  setLessonPlan(lessonPlan: LessonPlanQuery[]) {
    this.lessonPlan = lessonPlan;
  }
  getLessonPlan() {
    return [...this.lessonPlan];
  }
}
