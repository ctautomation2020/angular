import { query } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import {Apollo, QueryRef} from 'apollo-angular';
import gql from 'graphql-tag';
import { ActivatedRoute, Router } from '@angular/router';
import { AcademicsService } from '../academics.service';
import { Assessment, Section, Question, Evaluation, EvaluationQuestion } from '../academics.model';
import json from 'json-keys-sort';
import { MatDialog } from '@angular/material/dialog';
import { AlertBoxComponent } from 'src/app/shared/alert-box/alert-box.component';
import { ConfirmBoxComponent } from 'src/app/shared/confirm-box/confirm-box.component';
@Component({
  selector: 'app-evalutaion',
  templateUrl: './evalutaion.component.html',
  styleUrls: ['./evalutaion.component.scss']
})
export class EvalutaionComponent implements OnInit {
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
  bloomsLevel = [
    {
      Reference_Code: 16,
      Ref_Name: 'Knowledge',
      Description: '1'
    },
    {
      Reference_Code: 17,
      Ref_Name: 'Comprehension',
      Description: '2'
    },
    {
      Reference_Code: 18,
      Ref_Name: 'Application',
      Description: '3'
    },
    {
      Reference_Code: 19,
      Ref_Name: 'Analysis',
      Description: '4'
    },
    {
      Reference_Code: 20,
      Ref_Name: 'Synthesis',
      Description: '5'
    },
    {
      Reference_Code: 21,
      Ref_Name: 'Evaluation',
      Description: '6'
    }
  ]
  scoredMarks: number;
  constructor(public dialog: MatDialog, private activatedRoute: ActivatedRoute, private academicsService: AcademicsService, private router: Router, private apollo: Apollo) { }
  assessment: Assessment = {
    section: [],
    assess_num: 0,
    course_code: '',
    group_ref: 0,
    session_ref: 0,
    entry_date: new Date()
  };
  evaluationList: any;
  evaluation: Evaluation;
  courseTitle: string;
  sallot_id: number;
  reg_no: number;
  assess_num: number;
  totalMarks: number;
  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const assess_num = +params['assess_num'];
      this.sallot_id = +params['sallot_id'];
      const reg_no = +params['reg_no'];
      this.assess_num = assess_num;
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
              assess_num: assess_num,
              course_code: result.course_code,
              session_ref: result.session_ref,
              group_ref: result.group_ref
            }
            this.academicsService.getAssessment(new_query).subscribe((assessment_questions: any) => {
              if(assessment_questions.length == 0) {
                this.router.navigate(['/person-details', 'academics', 'assignment-list', this.sallot_id]);
              }
              const evaluation_query = {
                assess_num: assess_num,
              course_code: result.course_code,
              session_ref: result.session_ref,
              group_ref: result.group_ref,
              reg_no: reg_no
              }
              this.academicsService.getEvaluation(evaluation_query).subscribe((evaluation_list: any) => {
                this.evaluationList = evaluation_list;
                console.log(evaluation_list);
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
              let sections = groupBy(assessment_questions, 'section');
              let assessment: Assessment= {
                course_code: new_query.course_code,
                group_ref: new_query.group_ref,
                session_ref: new_query.session_ref,
                assess_num: assess_num,
                entry_date: new Date(),
                section: []
              }
              sections = json.sort(sections,true);
              let totalMarks = 0;
              Object.keys(sections).forEach(function(key) {
                const str = sections[key][0].question_num;
                const alpha = str.charAt(str.length - 1);
                let section: Section = {
                  name: key,
                  section_mark: sections[key][0].marks,
                  type: alpha == "a" || alpha == "b" ? "E": "F",
                  q_num: sections[key].length,
                  questions: []
                }
                totalMarks = totalMarks + (section.section_mark * section.q_num)
                for(let q of sections[key]) {
                  let mark = 0
                  if (evaluation_list.length != 0) {
                    const temp = evaluation_list.filter( (e: any) => e.question_num === q.question_num)[0];
                    mark = temp.mark;
                  }



                  const question: Question = {
                    question_num: q.question_num,
                    question_stmt: q.question_stmt,
                    marks: mark,
                    blooms_level: q.blooms_level,
                    co_num: q.co_num
                  }
                  section.questions.push(question);
                }
                assessment.section.push(section);
            });

            console.log(assessment);
            this.assessment = assessment;
            this.totalMarks = this.getTotal();
            this.evaluation = {
              course_code: assessment.course_code,
              group_ref: assessment.group_ref,
              session_ref: assessment.session_ref,
              assess_num: assessment.assess_num,
              reg_no: reg_no,
              questions: [],
              total_mark: this.totalMarks
            }
              })


            });
          this.academicsService.getCourse(result.course_code).subscribe((course: any) => {
            this.courseTitle = course.title;
          })

        }
      });

    });
  }
  getTotal() {
    let totalMarks = 0;
    console.log(this.assessment);
      for(let section of this.assessment.section){
        let flag = false;
        for(let ques of section.questions){
          if(section.type === 'F') {
            totalMarks += section.section_mark
          }
          else {
            if (!flag) {
              flag = !flag;
            }
            else {
              totalMarks += section.section_mark
              flag = !flag;
            }
          }


        }

      }
      return totalMarks;
  }
  findTotalMarks() {
    let total = 0;
    for (let section of this.assessment.section) {
      for ( let q of section.questions) {
        total = total + q.marks;
      }
    }
    this.scoredMarks = total;
    return total;
  }
  filterBL(bl: number) {
    return this.bloomsLevel.filter( b=> b.Reference_Code == bl)[0];
  }

  filterCO(co: number) {
    return this.coLevel.filter( b=> b.Reference_Code == co)[0];
  }
  onMarkSelect(q: any, section: Section) {
    const str = q.question_num;
    const alpha = str.charAt(str.length - 1);
    if (alpha != "a" || alpha != "b") {

    }
    if (alpha == "a") {
      let question_num = str.substring(0, str.length - 1);
      question_num += "b";
      const question = section.questions.filter((q) => q.question_num == question_num)[0];
      if(question.marks) {
        this.dialog.open(AlertBoxComponent, {data: {message: "Cannot evaluate " + str , submessage: "EITHER-OR Conflict! " + str + " question marks will be set to 0"},})
        q.marks = 0;
      }

    }
    else if( alpha == "b") {
      let question_num = str.substring(0, str.length - 1);
      question_num += "a";
      const question = section.questions.filter((q) => q.question_num == question_num)[0];
      if(question.marks) {
        this.dialog.open(AlertBoxComponent, {data: {message: "Cannot evaluate " + str , submessage: "EITHER-OR Conflict! " + str + " question marks will be set to 0"},})
        q.marks = 0;
      }

    }
    if(q.marks < 0) {
      this.dialog.open(AlertBoxComponent, {data: {message: "Given mark is invalid", submessage: "This question marks will be set to 0"},})
      q.marks = 0;
    }
    if (q.marks > section.section_mark) {
      this.dialog.open(AlertBoxComponent, {data: {message: "Given mark is greater than question weightage.", submessage:  "This question marks will be set to 0"},})
      q.marks = 0;

    }
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
    for (let section of this.assessment.section) {
      for (let q of section.questions) {
        const question: EvaluationQuestion = {
          question_num: q.question_num,
          mark: q.marks
        }
        this.evaluation.questions.push(question);
      }
    }
    if (this.evaluationList.length == 0 ) {
      console.log(this.evaluation)
      const req = gql`
    mutation createAssess_evaluation($data: assess_evaluationInput!) {
      createAssess_evaluation(data: $data) {
        cassesseval_id
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
      this.router.navigate(['/person-details', 'academics', 'evaluation', this.assess_num,this.sallot_id, this.reg_no])
    });
    }
    else {
      console.log(JSON.stringify(this.evaluation));
      const req = gql `
      mutation updateAssess_evaluation($data: assess_evaluationInput!) {
      updateAssess_evaluation(data: $data) {
        cassesseval_id
      }
    }
    `;
    this.apollo.mutate({
      mutation: req,
      variables: {
        data: this.evaluation
      }
    }).subscribe((data) => {
      this.router.navigate(['/person-details', 'academics', 'evaluation', this.assess_num,this.sallot_id, this.reg_no])
    })
    }
  }
}
