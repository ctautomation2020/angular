import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AcademicsComponent } from "./academics.component";
import { AssessmentListComponent } from "./assessment-list/assessment-list.component";
import { AssessmentComponent } from "./assessment/assessment.component";
import { CreateAssessmentComponent } from "./assessment/create-assessment/create-assessment.component";
import { AssignmentEvalutaionComponent } from "./assignment-evalutaion/assignment-evalutaion.component";
import { AssignmentListComponent } from "./assignment-list/assignment-list.component";
import { AssignmentComponent } from "./assignment/assignment.component";
import { AttendenceComponent } from "./attendence/attendence.component";
import { ViewAttendenceComponent } from "./attendence/view-attendence/view-attendence.component";
import { CourseFeaturesComponent } from "./course-features/course-features.component";
import { CourseListComponent } from "./course-list/course-list.component";
import { EvalutaionListComponent } from "./evalutaion-list/evalutaion-list.component";
import { EvalutaionComponent } from "./evalutaion/evalutaion.component";
import { LessonPlanCreateComponent } from "./lesson-plan/lesson-plan-create/lesson-plan-create.component";
import { LessonPlanModelComponent } from "./lesson-plan/lesson-plan-model/lesson-plan-model.component";
import { LessonPlanComponent } from "./lesson-plan/lesson-plan.component";
import { SessionComponent } from "./session/session.component";


const routes: Routes =  [
  {
    path: '',
    component: AcademicsComponent,
    children: [
      {
        path: '',
        component: SessionComponent
      },
      {
        path: 'course-list/:reference_id',
        component: CourseListComponent
      },
      {
        path: 'course-features/:sallot_id',
        component: CourseFeaturesComponent
      },
      {
        path: 'assessment-list/:sallot_id',
        component: AssessmentListComponent
      },
      {
        path: 'assignment-list/:sallot_id',
        component: AssignmentListComponent
      },
      {
        path: 'assignment/:sallot_id',
        component: AssignmentComponent
      },
      {
        path: 'assignment/:assign_num/:sallot_id',
        component: AssignmentComponent
      },
      {
        path: 'create-assessment/:sallot_id',
        component: CreateAssessmentComponent
      },
      {
        path: 'create-assessment/:assess_num/:sallot_id',
        component: CreateAssessmentComponent
      },
      {
        path: 'assessment/:sallot_id',
        component: AssessmentComponent
      },
      {
        path: 'assessment/:assess_num/:sallot_id',
        component: AssessmentComponent
      },
      {
        path: 'attendence/view-attendence',
        component: ViewAttendenceComponent
      },
      {
        path: 'attendence/:sallot_id',
        component: AttendenceComponent
      },
      {
        path: 'lesson-plan/:sallot_id',
        component: LessonPlanComponent
      },
      {
        path: 'lesson-plan/lesson-plan-create/:sallot_id',
        component: LessonPlanCreateComponent
      },
      {
        path: 'lesson-plan/lesson-plan-model/:sallot_id',
        component: LessonPlanModelComponent
      },

      {
        path: 'evaluation-list/:sallot_id',
        component: EvalutaionListComponent
      },
      {
        path: 'evaluation-list/:sallot_id/:assess_num',
        component: EvalutaionListComponent
      },
      {
        path: 'evaluation/:assess_num/:sallot_id/:reg_no',
        component: EvalutaionComponent
      },
      {
        path: 'assignment-evaluation/:assign_num/:sallot_id/:reg_no',
        component: AssignmentEvalutaionComponent
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcademicsRoutingModule {

}
