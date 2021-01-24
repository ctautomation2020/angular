import { Component, OnInit } from '@angular/core';
import {Apollo, QueryRef} from 'apollo-angular';
import gql from 'graphql-tag';
import { ActivatedRoute, Router } from '@angular/router';
import { AcademicsService } from '../academics.service';
import { Assessment, Section, Question, Evaluation, EvaluationQuestion, Assignment, AssignmentQuestion, AssignmentEvaluation, AssignmentEvaluationQuestion } from '../academics.model';
import { MatDialog } from '@angular/material/dialog';
import { AlertBoxComponent } from 'src/app/shared/alert-box/alert-box.component';
import { ConfirmBoxComponent } from 'src/app/shared/confirm-box/confirm-box.component';
@Component({
  selector: 'app-assignment-evalutaion',
  templateUrl: './assignment-evalutaion.component.html',
  styleUrls: ['./assignment-evalutaion.component.scss']
})
export class AssignmentEvalutaionComponent implements OnInit {
  coLevel = [
    {
      Reference_Code: 22,
      Ref_Name: '1'
    },
    {
      Reference_Code: 23,
      Ref_Name: '2'
    },
    {
      Reference_Code: 24,
      Ref_Name: '3'
    },
    {
      Reference_Code: 25,
      Ref_Name: '4'
    },
    {
      Reference_Code: 26,
      Ref_Name: '5'
    },
    {
      Reference_Code: 27,
      Ref_Name: '6'
    }

  ]
  scoredMarks: number;
  constructor(public dialog: MatDialog, private activatedRoute: ActivatedRoute, private academicsService: AcademicsService, private router: Router, private apollo: Apollo) { }
  assignment: Assignment = {
    questions: [],
    assign_num: 0,
    course_code: '',
    group_ref: 0,
    session_ref: 0,
    entry_date: new Date(),
    deadline: new Date()
  };
  evaluationList: any;
  evaluation: AssignmentEvaluation;
  courseTitle: string;
  sallot_id: number;
  reg_no: number;
  assign_num: number;
  totalMarks: number;

  ngOnInit(): void {this.activatedRoute.params.subscribe((params) => {
    const assign_num = +params['assign_num'];
    this.sallot_id = +params['sallot_id'];
    const reg_no = +params['reg_no'];
    this.assign_num = assign_num;
    this.reg_no = reg_no;
    const query = {
      sallot_id: this.sallot_id
     }
    this.academicsService.getCourseDetails(query).subscribe((result: any) => {
      if(result == null) {
        this.router.navigate(['/person-details', 'academics']);
      }
      else {
            const new_query = {
            assign_num: assign_num,
            course_code: result.course_code,
            session_ref: result.session_ref,
            group_ref: result.group_ref
          }
          console.log(new_query)
          this.academicsService.getAssignment(new_query).subscribe((assignment_questions: any) => {
            if(assignment_questions.length == 0) {
              this.router.navigate(['/person-details', 'academics', 'assignment-list', this.sallot_id]);
            }
            console.log(assignment_questions);
            const evaluation_query = {
              assign_num: assign_num,
            course_code: result.course_code,
            session_ref: result.session_ref,
            group_ref: result.group_ref,
            reg_no: reg_no
            }
            this.academicsService.getAssignmentEvaluation(evaluation_query).subscribe((evaluation_list: any) => {
              this.evaluationList = evaluation_list;
              console.log(evaluation_list);
              let assignment: Assignment= {
                course_code: new_query.course_code,
                group_ref: new_query.group_ref,
                session_ref: new_query.session_ref,
                assign_num: assign_num,
                entry_date: new Date(),
                questions: [],
                deadline: new Date()
              }
              let totalMarks = 0;
              for (let q of assignment_questions) {
              let mark = 0
                if (evaluation_list.length != 0) {
                  const temp = evaluation_list.filter( (e: any) => parseInt(e.question_num) == q.question_num)[0];
                  console.log(temp);
                  mark = temp.mark;
                }
                totalMarks = totalMarks + q.marks;
                const question: AssignmentQuestion = {
                  question_num: q.question_num,
                  question_stmt: q.question_stmt,
                  marks: mark,
                  co_num: q.co_num,
                  max_marks: q.marks
                }
                assignment.questions.push(question);

              }
          this.evaluation = {
            course_code: assignment.course_code,
            group_ref: assignment.group_ref,
            session_ref: assignment.session_ref,
            assign_num: assignment.assign_num,
            reg_no: reg_no,
            questions: []
          }
          console.log(assignment);
          this.assignment = assignment;
          this.totalMarks = totalMarks;
            })


          });
        this.academicsService.getCourse(result.course_code).subscribe((course: any) => {
          this.courseTitle = course.title;
        })

      }
    });

  });
}
onMarkSelect(q: AssignmentQuestion) {
  if (q.max_marks) {
    const marks = q.max_marks - q.marks;
    if (q.marks < 0) {
      this.dialog.open(AlertBoxComponent, {data: {message: "Given mark is invalid", submessage: "This question marks will be set to 0"},})
      q.marks = 0;
    }
    else if (marks < 0) {
      this.dialog.open(AlertBoxComponent, {data: {message: "Given mark is greater than question weightage.", submessage:  "This question marks will be set to 0"},})
      q.marks = 0;
    }

  }
}
findTotalMarks() {
  let total = 0;
  for (let q of this.assignment.questions) {
      total = total + q.marks;
  }
  this.scoredMarks = total;
  return total;
}

filterCO(co: number) {
  return this.coLevel.filter( b=> b.Reference_Code == co)[0];
}
onSubmit() {
  if ( this.scoredMarks < (this.totalMarks / 2) ) {
    let dialogOpen = this.dialog.open(ConfirmBoxComponent, {data: {message: "Total Marks Scored is less than 50%", submessage: "Click Submit to Continue"}})
    dialogOpen.afterClosed().subscribe((result) => {
      if(result) {
        this.submitEvaluation();
      }
    })
  }
  else {
    let dialogOpen = this.dialog.open(ConfirmBoxComponent, {data: {message: "Do you want to submit the evaluation", submessage: "Click Submit to Continue"}})
    dialogOpen.afterClosed().subscribe((result) => {
      if(result) {
        this.submitEvaluation();
      }
    })
  }

}
submitEvaluation() {
  for (let q of this.assignment.questions) {
    const question: AssignmentEvaluationQuestion = {
      question_num: +q.question_num,
      mark: q.marks
    }
    this.evaluation.questions.push(question);
}

if (this.evaluationList.length == 0 ) {
  console.log(this.evaluation);
  const req = gql`
mutation createAssign_evaluation($data: assign_evaluationInput!) {
  createAssign_evaluation(data: $data) {
    cassigneval_id
  }
}
`;
this.apollo.mutate({
  mutation: req,
  variables: {
    data: this.evaluation
  }
}).subscribe(({ data }) => {
  console.log(data);
  this.router.navigate(['/person-details', 'academics', 'assignment-evaluation', this.assign_num,this.sallot_id, this.reg_no])
});
}
else {
  console.log(JSON.stringify(this.evaluation));
  const req = gql `
  mutation updateAssign_evaluation($data: assign_evaluationInput!) {
  updateAssign_evaluation(data: $data) {
    cassigneval_id
  }
}
`;
this.apollo.mutate({
  mutation: req,
  variables: {
    data: this.evaluation
  }
}).subscribe((data) => {
  this.router.navigate(['/person-details', 'academics', 'assignment-evaluation', this.assign_num,this.sallot_id, this.reg_no])
})
}
}

}
