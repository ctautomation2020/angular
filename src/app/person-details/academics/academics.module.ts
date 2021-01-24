import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { SharedModule } from "src/app/shared/shared.module";
import { AcademicsRoutingModule } from "./academics-routing.module";
import { AcademicsComponent } from "./academics.component";
import { AssessmentListComponent } from "./assessment-list/assessment-list.component";
import { AssessmentComponent } from "./assessment/assessment.component";
import { CreateAssessmentComponent } from "./assessment/create-assessment/create-assessment.component";
import { AssignmentComponent } from "./assignment/assignment.component";
import { AttendenceComponent } from "./attendence/attendence.component";
import { ViewAttendenceComponent } from "./attendence/view-attendence/view-attendence.component";
import { CourseFeaturesComponent } from "./course-features/course-features.component";
import { CourseListComponent } from "./course-list/course-list.component";
import { SessionComponent } from './session/session.component';
import { EvalutaionComponent } from './evalutaion/evalutaion.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { EvalutaionListComponent } from './evalutaion-list/evalutaion-list.component';
import { SearchPipe } from "./evalutaion-list/search.pipe";
import { AssignmentListComponent } from './assignment-list/assignment-list.component';
import { AssignmentEvalutaionComponent } from './assignment-evalutaion/assignment-evalutaion.component';
import { LessonPlanComponent } from './lesson-plan/lesson-plan.component';
import { LessonPlanModelComponent } from './lesson-plan/lesson-plan-model/lesson-plan-model.component';
@NgModule({
  declarations: [
    AcademicsComponent,
    CourseListComponent,
    AssignmentComponent,
    AttendenceComponent,
    ViewAttendenceComponent,
    AssessmentComponent,
    AssessmentListComponent,
    CourseFeaturesComponent,
    CreateAssessmentComponent,
    SessionComponent,
    EvalutaionComponent,
    EvalutaionListComponent,
    SearchPipe,
    AssignmentListComponent,
    AssignmentEvalutaionComponent,
    LessonPlanComponent,
    LessonPlanModelComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    AcademicsRoutingModule,
    AngularEditorModule
  ]
})
export class AcademicsModule {

}
