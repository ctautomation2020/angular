import { Component, NgModule, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { AcademicsModel, Assessment, Question, Section  } from '../academics.model';
import { AcademicsService } from '../academics.service';

import gql from 'graphql-tag';
import json from 'json-keys-sort';
import { AngularEditorConfig } from '@kolkov/angular-editor';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.scss']
})

export class AssessmentComponent implements OnInit {
  totalMarks: number;
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
  sallot_id: number;
  courseTitle: string;
    sections:any[] = [];
    sectionsJSON: any = {
      section: [],
      assess_num: 0,
      course_code: '',
      group_ref: 0,
      session_ref: 0,
      entry_date: new Date()
    };

    questCount:any = 0;
    qmarks:any = 1;
    sect_name:any = "";
    total:number[] = [];

    constructor(private apollo: Apollo,private academicsService: AcademicsService, private activatedRoute: ActivatedRoute, private router: Router) {

    }
    getToolBar(section:number, ques:number){
      if(this.sections[section].currentQuest == ques) return true;
      return false;
    }
    getEditorConfig(section:number, ques:number){
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
            showToolbar: this.getToolBar(section,ques),
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
    createQuestion(mark:number = 0){
        return { question_num:"", question_stmt:"", blooms_level:"1", co_num:"1", marks:+mark };
    }
    resetSection(){
        this.questCount = 0;
        this.sect_name = null;
        this.qmarks = 1;
    }
    addSection(name:string, count:number, qtype:string, mark:number){
        if(!count || count == 0 || !name || name == "") return; // Alert User

        let questions:any[] = [];
        for(let i = 0; i < count; i++){
            if(qtype == "E"){
                questions.push(this.createQuestion(mark));
                questions.push(this.createQuestion(mark));
            }
            else questions.push(this.createQuestion(mark));
        }

        this.sections.push({
            currentQuest:-1,
            numQuestFlag:false,
            name:name,
            type:qtype,
            section_mark:+mark,
            questions: questions,
            showToolbar: false,
            q_num: (qtype == 'E') ? (questions.length)/2 : questions.length }
        );

        this.total.push(+count);

        this.resetSection();
    }
    getQuestNumber(i:number){
        return Math.round(i / 2);
    }
    getCharacter(i:number){
        return String.fromCharCode(97 + (i % 2));
    }
    updateSectionName(section:number, value:string){
        this.sections[section].name = value;
    }
    showConfirmSign(section:number){
        this.sections[section].numQuestFlag = true;
    }
    removeSection(section:number){
        this.total.splice(section,1);
        this.sections.splice(section,1);
        this.resetSection();
    }
    updateNumQuestions(section:number,qtype:string){
        this.sections[section].q_num = (qtype == 'E') ?
            (this.sections[section].questions.length)/2 :
            this.sections[section].questions.length;
    }
    updateSectionMark(section:number,value:number){
        this.sections[section].section_mark = +value;
        for(let ques of this.sections[section].questions){
            ques.marks = +value;
        }
    }
    addQuestions(section:number, count:number, start:number = 0, qtype:string, qmark:number){
        if(qtype == 'E') start /= 2;
        if(count <= start) return; // Alert User

        for(let i = start; i < count; i++){
            if(qtype == 'E'){
                this.sections[section].questions.push(this.createQuestion(qmark));
                this.sections[section].questions.push(this.createQuestion(qmark));
            }
            else this.sections[section].questions.push(this.createQuestion(qmark));
        }
        this.sections[section].numQuestFlag = false;
        this.updateNumQuestions(section,qtype);

        this.total[section] += (count - start);
        console.log(this.total);
    }
    makeEditable(section:number, ques:any){
      for(let sect of this.sections){
        sect.currentQuest = -1;
      }
      if(section != -1) this.sections[section].currentQuest = ques;
    }
    updateQuestion(section:number, index:number, value:string){
        this.sections[section].questions[index].question_stmt = value;
    }
    changeQType(section:number, ques:number, value:string){
        this.sections[section].questions[ques].blooms_level = value;
    }
    changeQCO(section:number, ques:number, value:string){
        this.sections[section].questions[ques].co_num = value;
    }
    saveChanges(event:any){
        if(!event.target.closest('.question-row')){
            this.makeEditable(-1,-1);
        }
    }
    deleteQuestion(section:number, quest:number, qtype:string){
        if(qtype == 'E'){
            if(quest % 2 == 0) this.sections[section].questions.splice(quest,2);
            else this.sections[section].questions.splice(quest-1,2);
        }
        else this.sections[section].questions.splice(quest,1);
        this.updateNumQuestions(section,qtype);

        this.total[section] -= 1;
        console.log(this.total);
    }
    getRemainingSectionQuestionCount(section:number){
        let sum = 0;
        if(section != 0){
            for(let i = 0; i < section; i++) sum += this.total[i];
        }
        return sum;
    }
    findTotalMarks() {
      let totalMarks = 0;
      for(let section of this.sections){
        for(let ques of section.questions){
          totalMarks += ques.marks


        }

      }
      this.totalMarks = totalMarks;
      return totalMarks;
    }
    changeSectionsArrayToJSON(){
        let qnum:number = 1;
        let count:number = 0;
      console.log(this.sections);
        for(let section of this.sections){
            for(let ques of section.questions){
              ques.blooms_level = +ques.blooms_level;
              ques.co_num = +ques.co_num;
                if(section.type == 'E'){
                    ques.question_num = qnum + this.getCharacter(count);
                    count++;
                    if(count % 2 == 0) { count = 0; qnum++; }
                }
                else ques.question_num = "" + qnum++;
            }
            delete section.currentQuest;
            delete section.numQuestFlag;
            delete section.showToolbar;
        }
        this.sectionsJSON.section = this.sections;
        this.sectionsJSON = this.sectionsJSON;

        console.log(JSON.parse(JSON.stringify(this.sectionsJSON)));
    }
    changeJSONToSectionsArray(){
      let count = 0;
        for(let section of this.sectionsJSON["section"]){
            section.currentQuest = -1;
            section.numQuestFlag = false;
            this.total[count] = (section.type == "F") ? section.q_num : (section.q_num)/2;
            count++;
        }

        this.sections = this.sectionsJSON["section"];
        console.log(this.sections);
    }
    showQuestions(){
        this.changeSectionsArrayToJSON(); // Create Assessment
        //this.changeJSONToSectionsArray(); // Edit Assessment
        console.log(JSON.parse(JSON.stringify(this.sectionsJSON)));
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
        data: JSON.parse(JSON.stringify(this.sectionsJSON))
      }
    }).subscribe(({ data }) => {
      console.log(data);
    });
    }
    ngOnInit(): void {
      let assessment: Assessment = {
        course_code: '',
        group_ref: 0,
        session_ref: 0,
        assess_num: 0,
        entry_date: new Date(),
        section: []
      };
        /*
        this.sections = [
             {
                 currentQuest:-1,
                 numQuestFlag:false,
                 name:"Part - A",
                 type:"E",
                 section_mark:3,
                 questions: [
                     { question_num:"1a", question_stmt:"What is the difference between MySQL and MongoDB?", blooms_level:"2", co_num:"2", marks:3 },
                     { question_num:"1b", question_stmt:"What are the different types of Normalization?", blooms_level:"1", co_num:"3", marks:3 }
                 ],
                 q_num:2
             }
         ];
        */
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
                  this.router.navigate(['/person-details', 'academics', 'assessment-list', this.sallot_id]);
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
                sections = json.sort(sections, true);
                assessment = {
                  course_code: new_query.course_code,
                  group_ref: new_query.group_ref,
                  session_ref: new_query.session_ref,
                  assess_num: assess_num,
                  entry_date: new Date(),
                  section: []
                }
                Object.keys(sections).forEach(function(key) {
                  console.log(sections);
                  const str = sections[key][0].question_num;
                  console.log(str);
                  const alpha = str.charAt(str.length - 1);
                  let section: Section = {
                    name: key,
                    section_mark: sections[key][0].marks,
                    type: alpha == "a" || alpha == "b" ? "E": "F",
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
              console.log(JSON.stringify(assessment));
              this.sectionsJSON = assessment;
              this.changeJSONToSectionsArray();

              });

            }
            else {

              this.sectionsJSON.course_code = result.course_code;
              this.sectionsJSON.entry_date = new Date();
              this.sectionsJSON.group_ref = result.group_ref;
              this.sectionsJSON.session_ref =  result.session_ref;
            }
            this.academicsService.getCourse(result.course_code).subscribe((course: any) => {
              this.courseTitle = course.title;
            });

          }
        });
      });


    }

    pdfHelper() {
      let str1 = '<div style="text-align: center"><div style="margin-top: 6px"><b>MIT Campus, Anna University</b></div><div style="margin-top: 6px"><b>Internal Assessment '+ this.sectionsJSON.assess_num +'</b></div><div  style="margin-top: 6px">Programme: B.E. (CSE)</div><div style="margin-top: 6px; margin-bottom: 6px;"><b>'+this.sectionsJSON.course_code+' - '+this.courseTitle.toUpperCase()+'</b></div></div><div><div style="margin-bottom: 6px;">Max Marks: '+ this.totalMarks+' </div><table><tr><th style="width: 25px">Sl. No</th><th style="width: 500px; margin-top: 8px; text-align: center; overflow:scroll;">Question</th><th style="width: 45px; margin-top: 8px; text-align: center">Marks</th> <th style="width: 25px; margin-top: 8px; text-align: center"> CO </th><th style="width: 25px ; margin-top: 8px; text-align: center"> BL </th></tr>';
      let tableStr = str1 + '';
      for (let s of this.sectionsJSON.section) {
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
      const code = this.sectionsJSON.course_code;
      const htmlToPdfmake = require('html-to-pdfmake');
      const content = this.pdfHelper();
      const val: any = htmlToPdfmake( content,{
        tableAutoSize:true
      });
      console.log(content);
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
    pdfMake.createPdf(dd).open();
    }
}
