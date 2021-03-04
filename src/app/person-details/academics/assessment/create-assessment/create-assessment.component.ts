import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {Apollo, QueryRef} from 'apollo-angular';
import gql from 'graphql-tag';
import { Assessment, Section, Question } from '../../academics.model';
import { AcademicsService } from '../../academics.service';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { map } from 'rxjs/operators';
import * as Quill from 'quill';

import { AngularEditorConfig } from '@kolkov/angular-editor';
import { table } from 'console';
import json from 'json-keys-sort';
import { PersonReferenceModel } from 'src/app/person-details/person-reference.model';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-create-assessment',
  templateUrl: './create-assessment.component.html',
  styleUrls: ['./create-assessment.component.scss']
})
export class CreateAssessmentComponent implements OnInit {
  htmlContent: string;
  assessmentPdf: any = [];
  sampleHtml: string;

editorConfig: AngularEditorConfig = {
    editable: true,
      spellcheck: true,
      height: 'auto',
      minHeight: '0',
      maxHeight: 'auto',
      width: 'auto',
      minWidth: '0',
      translate: 'yes',
      enableToolbar: true,
      showToolbar: true,
      placeholder: 'Enter text here...',
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
  sectionType = [
    {
      id: 1,
      type: 'FIXED'
    },
    {
      id: 2,
      type: 'EITHER OR'
    }
  ]
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
  assessment: Assessment = {
    section: [],
    assess_num: 0,
    course_code: '',
    group_ref: 0,
    session_ref: 0,
    entry_date: new Date()
  };
  choiceType: boolean = true;
  courseTitle: string;
  session: PersonReferenceModel;
  sallot_id: number;
  queryRef: QueryRef<Assessment, any>;
  constructor(private apollo: Apollo,private academicsService: AcademicsService, private activatedRoute: ActivatedRoute, private router: Router) { }



  sample() {
    console.log(this.sampleHtml);
  }
  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.sallot_id = +params['sallot_id'];
      const assess_num = +params['assess_num'];
      const query = {
       sallot_id: this.sallot_id
      }
      this.academicsService.getCourseDetails(query).subscribe((result: any) => {
        if(result == null) {
          this.router.navigate(['/person-details', 'academics']);
        }
        else {

          if(assess_num) {
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
              /*
              sections = [ { name: , }, {}, {}]

              */
              let sections = groupBy(assessment_questions, 'section');
              let assessment: Assessment= {
                course_code: new_query.course_code,
                group_ref: new_query.group_ref,
                session_ref: new_query.session_ref,
                assess_num: assess_num,
                entry_date: new Date(),
                section: []
              }
              console.log(sections);
              sections = json.sort(sections, true);
              Object.keys(sections).forEach(function(key) {
                console.log(key);
                const str = sections[key][0].question_num;
                console.log(str);
                const alpha = str.charAt(str.length - 1);
                let section: Section = {
                  name: key,
                  section_mark: sections[key][0].marks,
                  type: alpha == "a" || alpha == "b" ? "EITHER OR": "FIXED",
                  q_num: sections[key].length,
                  questions: []
                }
                for(let q of sections[key]) {
                  const question: Question = {
                    question_num: q.question_num,
                    question_stmt: q.question_stmt,
                    marks: q.marks,
                    blooms_level: q.blooms_level,
                    co_num: q.co_num
                  }
                  section.questions.push(question);
                }
                assessment.section.push(section);
            });
            console.log(assessment);
            this.assessment = assessment;

            });

          }
          else {

            this.assessment.course_code = result.course_code;
            this.assessment.entry_date = new Date();
            this.assessment.group_ref = result.group_ref;
            this.assessment.session_ref =  result.session_ref;
          }
          this.academicsService.getCourse(result.course_code).subscribe((course: any) => {
            this.courseTitle = course.title;
          })

        }
      });
    });
   /* this.session = this.academicsService.session;
    console.log(this.session);
    this.assessment.course_code = this.session.course_code;
    this.assessment.entry_date = new Date();
    this.assessment.group_ref = this.session.group_ref;
    this.assessment.session_ref =  this.session.session_ref;*/
  }

  onQuestionNumberSelect(section: Section, sId: number): void {
    let newQuestions = section.q_num - section.questions.length;
    if (newQuestions < 0) {
      newQuestions = section.q_num;
      section.questions = [];
    }
    let qNo = 1;
    if (sId > 0) {
      for (let i=0;i<sId; i++) {
        qNo += +this.assessment.section[i].q_num;
      }

    }
    for (let i=0; i<newQuestions; i++) {
      if (section.type == 'FIXED') {
        const question: Question = {
          question_num : String(qNo),
          question_stmt: '',
          marks: 0,
          blooms_level: 0,
          co_num: 0
        }
        section.questions.push(question);
      }
      else {
        const questionA: Question = {
          question_num : String(qNo) + 'a',
          question_stmt: '',
          marks: 0,
          blooms_level: 0,
          co_num: 0
        }
        const questionB: Question = {
          question_num : String(qNo) + 'b',
          question_stmt: '',
          marks: 0,
          blooms_level: 0,
          co_num: 0
        }
        section.questions.push(questionA);
        section.questions.push(questionB);
      }
      qNo = +qNo + 1;

    }
  }
  createQuestion(section: Section) {

    const question: Question = {
      question_num : '',
      question_stmt: '',
      marks: section.section_mark,
      blooms_level: 0,
      co_num: 0
    }
    section.q_num = +section.q_num + 1;
    section.questions.push(question);
  }
  createSection() {
    const section: Section = {
      name: '',
      section_mark: 0,
      q_num: 0,
      type: '',
      questions: [

      ]
    }
    this.assessment.section.push(section);

  }
  onSectionType(s: Section) {

    s.q_num = 0;
    s.questions = [];
  }
  deleteQuestion(section: Section, qId: number) {
    section.questions.splice(qId, 1);
    section.q_num = +section.q_num - 1;
  }
  setQuestionNum(q:Question,type: string, sId: number, qId: number): string {
    if(sId === 0) {
      if (type === 'EITHER OR') {
        const choice = this.choiceType? 'a': 'b';
        this.choiceType = !this.choiceType;
        q.question_num = String(qId + 1) + choice;
        return q.question_num;
      }
      q.question_num = String(qId + 1);
      return q.question_num;
    }
    let qNo = 0;
    for (let i=0;i<sId; i++) {
      qNo += this.assessment.section[i].questions.length;
    }
    q.question_num = String(qNo + qId + 1);
    return q.question_num;

  }
  setMarks(s: Section) {
    for (let q of s.questions) {
      q.marks = s.section_mark;
    }
  }
  deleteSection(s:Section[], sId: number) {
    s.splice(sId, 1);
  }
  submitAssessment(): void {
    console.log(this.assessment);
    const req = gql`
      mutation createAssessment($data: custom_type!) {
        createAssessment(data: $data) {
          cassess_id
        }
      }
    `;
    this.apollo
    .mutate({
      mutation: req,
      variables: {
        data: this.assessment
      }
    }).subscribe(({ data }) => {
      console.log(data);
    });
  }
  addListTOPDF() {
    const htmlToPdfmake = require('html-to-pdfmake');
    this.assessmentPdf = [];
    console.log(this.assessment);
    this.assessmentPdf.push([{text: 'Sl.No', style: 'head'}, {text: 'Question', style: ['head', 'subhead']}, {text: 'Marks',style: ['head', 'subhead']}, {text: 'CO', style: ['head', 'subhead']}, {text: 'BL', style: ['head','subhead']}]);
    for (let s of this.assessment.section) {
      const sectionName = s.name.toUpperCase() + ' ' + '(' + s.q_num + ' x ' + s.section_mark + ' = ' + (+s.q_num * s.section_mark) + 'Marks)' ;
    this.assessmentPdf.push([{text: sectionName, alignment: 'center',
    colSpan: 5, bold: true}, {}, {}, {}, {}]);
      for (let q of s.questions) {
        const qNo = q.question_num + '.';
        const cL = this.coLevel.filter(c => c.Reference_Code === q.co_num)[0];
        const bL = this.bloomsLevel.filter( b => b.Reference_Code === q.blooms_level)[0];
        this.assessmentPdf.push([qNo, htmlToPdfmake(q.question_stmt) ,{text: q.marks, style: ['center']},
              {text: cL.Ref_Name, style: ['center']},
              {text: 'L.' + bL.Description , style: ['center']}]);
        const alpha = q.question_num.charAt(q.question_num.length - 1);
        if (alpha == "a") {
          this.assessmentPdf.push([{text: "OR", alignment: 'center',
    colSpan: 5, bold: true}, {}, {}, {}, {}]);
        }
        else if(alpha == "b"){
          this.assessmentPdf.push([{text: " ", alignment: 'center',
    colSpan: 5, bold: true}, {}, {}, {}, {}]);
        }
      }
    }

  }
  pdfHelper() {
    let str1 = '<div style="text-align: center"><div style="margin-top: 6px"><b>MIT Campus, Anna University</b></div><div style="margin-top: 6px"><b>Internal Assessment '+ this.assessment.assess_num +'</b></div><div  style="margin-top: 6px">Programme: B.E. (CSE)</div><div style="margin-top: 6px; margin-bottom: 6px;"><b>'+this.assessment.course_code+' - '+this.courseTitle.toUpperCase()+'</b></div></div><div><table><tr><th style="width: 25px">Sl. No</th><th style="width: 500px; margin-top: 8px; text-align: center">Question</th><th style="width: 45px; margin-top: 8px; text-align: center">Marks</th> <th style="width: 25px; margin-top: 8px; text-align: center"> CO </th><th style="width: 25px ; margin-top: 8px; text-align: center"> BL </th></tr>';
    let tableStr = str1 + '';
    for (let s of this.assessment.section) {
      let section = '<tr><td colspan="5" style="text-align: center; font-weight: bold">'+ s.name.toUpperCase() +
        ' (' + s.q_num + ' x ' + s.section_mark + ' = ' + (+s.q_num * s.section_mark) + 'Marks)' +'</td></tr>'
      let questions = '';
        for (let q of s.questions) {
          const cL = this.coLevel.filter(c => c.Reference_Code === q.co_num)[0];
        const bL = this.bloomsLevel.filter( b => b.Reference_Code === q.blooms_level)[0];
        questions += '<tr><td>' + q.question_num +'.</td><td>'+ q.question_stmt +'</td> <td style="text-align: center">'+ q.marks+'</td><td style="text-align: center">'+ cL.Ref_Name +'</td><td style="text-align: center">L.'+ bL.Description +'</td></tr>';
        const alpha = q.question_num.charAt(q.question_num.length - 1);
        if (alpha == "a") {
          questions += '<tr><td colspan="5" style="text-align: center; font-weight: bold"> OR </td></tr>';
        }
        else if(alpha == "b"){
          questions += '<tr><td colspan="5" style="text-align: center; font-weight: bold"> ' + ' ' + '   </td></tr>';
        }

      }
      tableStr += section + questions;
    }
    return tableStr;
  }
  generatePDF() {
    const htmlToPdfmake = require('html-to-pdfmake');
    const content = this.pdfHelper();
    const val: any = htmlToPdfmake( content,{
      tableAutoSize:true
    });
    console.log(content);
    var dd = {content:val} ;
  pdfMake.createPdf(dd).open();
  }
  getAssessmentModel() {

  }
  getAssessment(query: any) {
    const req = gql`
  query assessment($data: assesmentQueryInput!) {
    assessment(data: $data) {
      cassess_id
      course_code
      group_ref
      session_ref
      assess_num
      question_num
      question_stmt
      blooms_level
      co_num
      marks
      section
    }
  }
  `;
  return this.apollo
  .watchQuery({
    query: req,
    variables: {
      data: query
    }
  }).valueChanges.pipe(map((result: any) =>
  JSON.parse(JSON.stringify(result.data.assessment))
  ));
  }
}
