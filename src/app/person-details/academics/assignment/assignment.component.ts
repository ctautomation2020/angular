import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {Apollo, QueryRef} from 'apollo-angular';
import gql from 'graphql-tag';
import {Assignment, Section, Question, AssignmentQuestion } from '../academics.model';
import { AcademicsService } from '../academics.service';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { map } from 'rxjs/operators';
import * as Quill from 'quill';

import { AngularEditorConfig } from '@kolkov/angular-editor';
import { table } from 'console';
import json from 'json-keys-sort';
import { DateAdapter } from '@angular/material/core';
import { ConfirmBoxComponent } from 'src/app/shared/confirm-box/confirm-box.component';
import { MatDialog } from '@angular/material/dialog';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html',
  styleUrls: ['./assignment.component.scss', '../assessment/assessment.component.scss']
})
export class AssignmentComponent implements OnInit {

    assignment: Assignment = {
      course_code:"",
      group_ref:0,
      session_ref:0,
      entry_date: new Date(),
      assign_num:0,
      deadline: new Date(),
      questions: []
  };
    questions:AssignmentQuestion[];

    currentQuest:any;
    numQuestFlag:boolean;


    coNumbers: any = []
  sallot_id: number;
  courseTitle: string;
  totalMarks: number;
  status: string;
    constructor(public dialog: MatDialog, private apollo: Apollo,private academicsService: AcademicsService, private activatedRoute: ActivatedRoute, private router: Router, private dateAdapter: DateAdapter<Date>) {

    }
    getToolBar(ques:number){
        if(this.currentQuest == ques) return true;
        return false;
    }
    getEditorConfig(ques:number){
        let editorConfig: AngularEditorConfig = {
            editable: true,
            spellcheck: true,
            height: 'auto',
            minHeight: '0',
            maxHeight: 'auto',
            width: 'auto',
            minWidth: '0',
            translate: 'yes',
            placeholder: 'Enter text here...',
            enableToolbar: true,
            showToolbar: this.getToolBar(ques),
            defaultParagraphSeparator: '',
            defaultFontName: '',
            defaultFontSize: '',
            fonts: [
            {class: 'arial', name: 'Arial'},
            {class: 'times-new-roman', name: 'Times New Roman'},
            {class: 'calibri', name: 'Calibri'},
            {class: 'comic-sans-ms', name: 'Comic Sans MS'}
            ],
            uploadUrl: '',
            uploadWithCredentials: false,
            sanitize: true,
            toolbarPosition: 'top',
            toolbarHiddenButtons: [
              ['justifyLeft',
              'justifyCenter',
              'justifyRight',
              'justifyFull'],
              ['textColor',
              'backgroundColor','insertVideo','removeFormat',
              'toggleEditorMode', 'link', 'unlink']
            ]
        };
        return editorConfig;
    }
    saveChanges(event:any){
        if(!event.target.closest(".question-row")){
            this.makeEditable(-1);
        }
    }
    createQuestion(mark:number = 0){
        return { question_num:"", question_stmt:"", question_img:"", co_num:1, marks:mark };
    }
    showConfirmSign(){
        this.numQuestFlag = true;
    }
    addQuestions(count:number, start:number = 0, qmark:number){
        if(count <= start) return; // Alert User

        for(let i = start; i < count; i++){
            this.questions.push(this.createQuestion(qmark));
        }

        this.updateQNum();
        this.numQuestFlag = false;
    }
    makeEditable(ques:any){
        this.currentQuest = ques;
    }
    changeQCO(ques:number, value:number){
      console.log(+value);
        this.questions[ques].co_num = +value;
    }
    updateQNum(){
        this.questions.forEach(function(quest, index){
            quest.question_num = "" + (index + 1);
        });
    }
    getTotalMarks(){
        let total = 0;
        this.questions.forEach(quest => {
            total += quest.marks;
        });
        this.totalMarks = total;
        return total;
    }
    deleteQuestion(quest:number){
        this.questions.splice(quest,1);
        this.updateQNum();
    }
    initAssignment(){
        this.questions = [];
        this.assignment = {
            course_code:"",
            group_ref:0,
            session_ref:0,
            entry_date: new Date(),
            assign_num:0,
            deadline: new Date(),
            questions:this.questions
        };
    }
    ngOnInit(): void {
      this.initAssignment();
      this.activatedRoute.params.subscribe(params => {
              this.sallot_id = +params['sallot_id'];
              const assign_num = +params['assign_num'];
              const query = {
               sallot_id: this.sallot_id
              }
              this.academicsService.getCourseDetails(query).subscribe((result: any) => {
                if(result == null) {
                  this.router.navigate(['/person-details', 'academics']);
                }
                else {

                  if(assign_num) {
                    const new_query = {
                      assign_num: assign_num,
                      course_code: result.course_code,
                      session_ref: result.session_ref,
                      group_ref: result.group_ref
                    }
                    this.academicsService.getAssignment(new_query).subscribe((assignment_questions: any) => {
                      if(assignment_questions.length == 0) {
                        this.router.navigate(['/person-details', 'academics', 'assignment-list', this.sallot_id]);
                      }


                      let assignment: Assignment= {
                        course_code: new_query.course_code,
                        group_ref: new_query.group_ref,
                        session_ref: new_query.session_ref,
                        assign_num: assign_num,
                        entry_date: new Date(),
                        questions: [],
                        deadline: new Date()
                      }
                      for (let q of assignment_questions) {
                        const question: AssignmentQuestion = {
                          question_num: q.question_num,
                          question_stmt: q.question_stmt,
                          marks: q.marks,
                          co_num: q.co_num
                        }
                        this.questions.push(question);
                      }
                    this.status = 'UPDATE';
                    this.assignment = assignment;
                    this.assignment.questions = this.questions;
                    console.log(this.assignment);
                    });

                  }
                  else {

                    this.status = 'CREATE';
                    this.assignment.course_code = result.course_code;
                    this.assignment.entry_date = new Date();
                    this.assignment.group_ref = result.group_ref;
                    this.assignment.session_ref =  result.session_ref;
                  }
                  this.academicsService.getCourse(result.course_code).subscribe((course: any) => {
                    this.courseTitle = course.title;
                  })
                  this.academicsService.getCoObjectives(result.course_code).subscribe((co: any) => {
                    this.coNumbers = co;
                    console.log(co);
                  })

                }
              });
            });
    }

//   htmlContent: string;
//   assessmentPdf: any = [];
//   sampleHtml: string;

// editorConfig: AngularEditorConfig = {
//     editable: true,
//       spellcheck: true,
//       height: 'auto',
//       minHeight: '0',
//       maxHeight: 'auto',
//       width: 'auto',
//       minWidth: '0',
//       translate: 'yes',
//       enableToolbar: true,
//       showToolbar: true,
//       placeholder: 'Enter text here...',
//       defaultParagraphSeparator: '',
//       defaultFontName: '',
//       defaultFontSize: '',
//       fonts: [
//         {class: 'arial', name: 'Arial'},
//         {class: 'times-new-roman', name: 'Times New Roman'},
//         {class: 'calibri', name: 'Calibri'},
//         {class: 'comic-sans-ms', name: 'Comic Sans MS'}
//       ],
//     uploadUrl: '',
//     uploadWithCredentials: false,
//     sanitize: true,
//     toolbarPosition: 'top',
//     toolbarHiddenButtons: [
//       ['justifyLeft',
//       'justifyCenter',
//       'justifyRight',
//       'justifyFull'],
//       ['textColor',
//       'backgroundColor','insertVideo','removeFormat',
//       'toggleEditorMode', 'link', 'unlink']
//     ]
// };
//   sectionType = [
//     {
//       id: 1,
//       type: 'FIXED'
//     },
//     {
//       id: 2,
//       type: 'EITHER OR'
//     }
//   ]

//   assignment: Assignment = {
//     questions: [],
//     assign_num: 0,
//     course_code: '',
//     group_ref: 0,
//     session_ref: 0,
//     entry_date: new Date(),
//     deadline: new Date()
//   };
//   choiceType: boolean = true;
//   courseTitle: string;
//   session: PersonReferenceModel;
//   sallot_id: number;
//   queryRef: QueryRef<Assignment, any>;
//   constructor(private apollo: Apollo,private academicsService: AcademicsService, private activatedRoute: ActivatedRoute, private router: Router) { }
//   ngOnInit(): void {
//     this.activatedRoute.params.subscribe(params => {
//       this.sallot_id = +params['sallot_id'];
//       const assign_num = +params['assign_num'];
//       const query = {
//        sallot_id: this.sallot_id
//       }
//       this.academicsService.getCourseDetails(query).subscribe((result: any) => {
//         if(result == null) {
//           this.router.navigate(['/person-details', 'academics']);
//         }
//         else {

//           if(assign_num) {
//             const new_query = {
//               assign_num: assign_num,
//               course_code: result.course_code,
//               session_ref: result.session_ref,
//               group_ref: result.group_ref
//             }
//             this.academicsService.getAssignment(new_query).subscribe((assignment_questions: any) => {
//               if(assignment_questions.length == 0) {
//                 this.router.navigate(['/person-details', 'academics', 'assignment-list', this.sallot_id]);
//               }


//               let assignment: Assignment= {
//                 course_code: new_query.course_code,
//                 group_ref: new_query.group_ref,
//                 session_ref: new_query.session_ref,
//                 assign_num: assign_num,
//                 entry_date: new Date(),
//                 questions: [],
//                 deadline: new Date()
//               }
//               for (let q of assignment_questions) {
//                 const question: AssignmentQuestion = {
//                   question_num: q.question_num,
//                   question_stmt: q.question_stmt,
//                   marks: q.marks,
//                   co_num: q.co_num
//                 }
//                 assignment.questions.push(question);

//               }
//             console.log(assignment);
//             this.assignment = assignment;

//             });

//           }
//           else {

//             this.assignment.course_code = result.course_code;
//             this.assignment.entry_date = new Date();
//             this.assignment.group_ref = result.group_ref;
//             this.assignment.session_ref =  result.session_ref;
//           }
//           this.academicsService.getCourse(result.course_code).subscribe((course: any) => {
//             this.courseTitle = course.title;
//           })

//         }
//       });
//     });
//   }
//   setQuestionNum(q: AssignmentQuestion, qId: number) {
//     q.question_num = qId + 1;
//     return q.question_num
//   }
//   createQuestion() {

//     const question: AssignmentQuestion = {
//       question_num : 0,
//       question_stmt: '',
//       marks: 0,
//       co_num: 0
//     }
//     this.assignment.questions.push(question);
//   }
//   deleteQuestion(qId: number) {
//     this.assignment.questions.splice(qId, 1);
//   }
  submitAssignment() {

    console.log(this.assignment);
    let dialogOpen = this.dialog.open(ConfirmBoxComponent, {data: {message: "Do you want to submit the assignment?", submessage: "Click Submit to Continue"}})
    dialogOpen.afterClosed().subscribe((result) => {
      if(result) {
    console.log(this.assignment.entry_date.toISOString())
    const req = gql`
      mutation createAssignment($data: custom_assignment_type!) {
        createAssignment(data: $data) {
          cassign_id
        }
      }
    `;
    this.apollo
    .mutate({
      mutation: req,
      variables: {
        data: this.assignment
      }
    }).subscribe(({ data }) => {
      console.log(data);
    });
      }
    })

  }
  pdfHelper() {
    let str1 = '<div style="text-align: center"><div style="margin-top: 6px"><b>MIT Campus, Anna University</b></div><div style="margin-top: 6px"><b>Assignment '+ this.assignment.assign_num +'</b></div><div  style="margin-top: 6px">Programme: B.E. (CSE)</div><div style="margin-top: 6px; margin-bottom: 6px;"><b>'+this.assignment.course_code+' - '+this.courseTitle.toUpperCase()+'</b></div></div><div><div style="margin-bottom: 6px;">Max Marks: '+ this.totalMarks+' </div><table><tr><th style="width: 25px">Sl. No</th><th style="width: 525px; margin-top: 8px; text-align: center">Question</th><th style="width: 45px; margin-top: 8px; text-align: center">Marks</th> <th style="width: 25px; margin-top: 8px; text-align: center"> CO </th></tr>';
    let tableStr = str1 + '';
    let questions = '';
    for (let q of this.assignment.questions) {

        const cL = this.coNumbers.filter((c: any) => c.cartimat_id === q.co_num)[0];
        questions += '<tr><td>' + q.question_num +'.</td><td>'+ q.question_stmt +'</td> <td style="text-align: center">'+ q.marks+'</td><td style="text-align: center">'+ cL.conum +'</td></tr>';
    }

    tableStr = tableStr+  questions;
    return tableStr;
  }
  generatePDF() {
    const code = this.assignment.course_code;
    const htmlToPdfmake = require('html-to-pdfmake');
    const content = this.pdfHelper();
    const val: any = htmlToPdfmake( content,{
      tableAutoSize:true
    });

    var dd: any = {content:val,
      footer: function(currentPage: any, pageCount: any) { return [
        { text: currentPage.toString() + ' of ' + pageCount, style: 'footer'}
      ] },
header: function(currentPage: any, pageCount: any, pageSize: any) {
  // you can apply any logic and return any valid pdfmake element

  return [
    { text: code, alignment: (currentPage % 2) ? 'left' : 'right', style: 'header' },
    { canvas: [ { type: 'rect', x: 170, y: 32, w: pageSize.width - 170, h: 40 } ] }
  ]
}, styles: {
  header: {
    margin:[8, 10, 10, 8],
    italics: true
  },
  footer: {
    alignment: 'center',
    margin:[0, 5, 0, 0]
  }
  }

    }
    console.log(dd);

  pdfMake.createPdf(dd).open();
  }
}
