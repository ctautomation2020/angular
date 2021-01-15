import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {Apollo, QueryRef} from 'apollo-angular';
import gql from 'graphql-tag';
import { AcademicsModel } from '../academics.model';
import { AcademicsService } from '../academics.service';

@Component({
  selector: 'app-evalutaion-list',
  templateUrl: './evalutaion-list.component.html',
  styleUrls: ['./evalutaion-list.component.scss']
})
export class EvalutaionListComponent implements OnInit {
  evaluationList = ["Assessment", "Assignment"];
  constructor(private academicsService: AcademicsService, private activatedRoute: ActivatedRoute, private router: Router) { }
  sallot_id: number;
  session: AcademicsModel;
  courseTitle: string;
  students: any;
  assessList: any;
  assignList: any;
  assess_num: number;
  assign_num: number;
  searchText: any;
  selectedChoice: string;
  ngOnInit(): void {

    this.activatedRoute.params.subscribe((params) => {
      this.sallot_id = +params['sallot_id'];
      const query = {
        sallot_id : this.sallot_id
      }
      this.academicsService.getCourseDetails(query).subscribe((course) => {
        if(course == null) {
          this.router.navigate(['/person-details', 'academics']);
        }
        else {
          const new_query = {
            course_code : course.course_code,
            group_ref: course.group_ref,
            session_ref: course.session_ref
          }
          this.academicsService.getAssessmentList(new_query).subscribe((assessList: any) => {
            this.assessList = assessList.sort();
          });
          this.academicsService.getAssignmentList(new_query).subscribe((assignList: any) => {
            this.assignList = assignList.sort();
          });
          this.academicsService.getCourseRegisteredStudents(new_query).subscribe((students) => {
            console.log(students);
            this.students = students;

          });
          this.academicsService.getSession(course.session_ref).subscribe((session) => {
            this.session = session[0];
          })
          this.academicsService.getCourse(course.course_code).subscribe((course: any) => {
            this.courseTitle = course.title;
          })

        }

      })
    })

  }
  onAssignSelect() {
    for (let s of this.students) {
      let evaluation_query = {
        assign_num: this.assign_num,
        course_code: s.course_code,
        session_ref: s.session_ref,
        group_ref: s.group_ref,
        reg_no: s.student.reg_no
      }
      this.academicsService.getAssignmentEvaluation(evaluation_query).subscribe((evaluation_list: any) => {
        console.log(evaluation_list);
        if (evaluation_list.length == 0) {
          s.evaluated = false;
        }
        else {
          s.evaluated = true;
        }

      });
    }

  }
  onAssessSelect() {
    for (let s of this.students) {
      let evaluation_query = {
        assess_num: this.assess_num,
        course_code: s.course_code,
        session_ref: s.session_ref,
        group_ref: s.group_ref,
        reg_no: s.student.reg_no
      }
      this.academicsService.getEvaluation(evaluation_query).subscribe((evaluation_list: any) => {
        if (evaluation_list.length == 0) {
          s.evaluated = false;
        }
        else {
          s.evaluated = true;
        }

      });
    }
  }

}
