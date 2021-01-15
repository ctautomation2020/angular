import { Component, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AcademicsModel } from '../academics.model';
import { AcademicsService } from '../academics.service';
import { AttendenceModel } from './attendence.model';
import {Apollo, QueryRef} from 'apollo-angular';
import gql from 'graphql-tag';

import json from 'json-keys-sort';
@Component({
  selector: 'app-attendence',
  templateUrl: './attendence.component.html',
  styleUrls: ['./attendence.component.scss']
})
export class AttendenceComponent implements OnInit {
  selectedFoods = ['pizza-1', 'steak-0'];

  allfoods: any = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'},
    {value: 'pasta-3', viewValue: 'Pasta'}
  ];


  selectedDate: Date = new Date();
  selectedPeriods: any = [];
  period: any = [ {
    value: 1,
    disabled: false,
  },{
    value: 2,
    disabled: false,
  },{
    value: 3,
    disabled: false,
  },{
    value: 4,
    disabled: false,
  },{
    value: 5,
    disabled: false,
  },{
    value: 6,
    disabled: false,
  },{
    value: 7,
    disabled: false,
  },{
    value: 8,
    disabled: false,
  }
];
  periods: { period: number; students: { reg_no: any; presence: any; }[]; }[];
  query: { course_code: any; group_ref: any; session_ref: any; };
  constructor(private academicsService: AcademicsService, private apollo: Apollo, private activatedRoute: ActivatedRoute, private router: Router, private dateAdapter: DateAdapter<Date>) {
    this.dateAdapter.setLocale('en-GB');
   }
  sallot_id: number;
  session: AcademicsModel;
  courseTitle: string;
  students: any;
  searchText: any;
  selectedChoice: string;
  attendence: any;
  checkPresence(p: any, st: any) {
    const student = p.students.filter((s: any) => s.reg_no == st.reg_no)[0];
    return student.presence;
  }
  onPeriodChange(event: any) {
    this.attendence.periods = [];
    this.selectedPeriods = event;
    console.log(this.selectedPeriods);
    for (let p of this.selectedPeriods) {
      const period: any = {
        period: p,
        students: []
      }
      for (let s of this.students) {
        const periods = this.periods.filter((pe: any) => pe.period == p)[0];
        console.log(s, periods);
        let presence;
        if (!periods) {
          presence = 'P';
        }
        else {
          presence = periods.students.filter((st: any) => st.reg_no === s.student.reg_no )[0].presence;

        }
        const student = {
          reg_no: s.student.reg_no,
          presence: presence
        }
        period.students.push(student);
      }
      this.attendence.periods.push(period);
    }
  }
  getAttendence() {
    this.selectedPeriods = [];
    this.periods = [];
    for (let p of this.period) {
      p.disabled = false;
    }
    const d = new Date(this.selectedDate);
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    console.log(this.selectedDate, date);
    this.attendence = {
      course_code : this.query.course_code,
      group_ref: this.query.group_ref,
      session_ref: this.query.session_ref,
      date: date,
      periods: []
    }
    let new_query = {
      course_code : this.query.course_code,
      group_ref: this.query.group_ref,
      session_ref: this.query.session_ref,
      date: date
    }
    console.log(JSON.stringify(new_query))
    this.academicsService.getAttendance(new_query).subscribe((attendence_list) => {
      if(attendence_list.length != 0) {

        console.log(attendence_list);
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
          let periods = groupBy(attendence_list, 'period');
          periods = json.sort(periods, true);
          let selectedPeriods: any = []
          let period_new: { period: number; students: { reg_no: any; presence: any; }[]; }[] = [];
          Object.keys(periods).forEach((key) => {
            let students = [];
            selectedPeriods.push(+key);
            for (let s of periods[key]) {
              const student = {
                reg_no: s.student.reg_no,
                presence: s.presence
              }
              students.push(student);
            }
            const period = {
              period: +key,
              students: students
            }
            period_new.push(period);
          });
          this.periods = period_new;
          this.attendence.periods = period_new;
          this.selectedPeriods = selectedPeriods;
          for (let p of selectedPeriods) {
            let period = this.period.filter((pe: any) => pe.value == p)[0];
            period.disabled = true;
          }
      }
      this.academicsService.getCourseRegisteredStudents(this.query).subscribe((students) => {

        this.students = students;
        for (let s of this.students) {
          s.student.presence = 'P';
        }
      });
    })
  }
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
          this.query = {
            course_code : course.course_code,
            group_ref: course.group_ref,
            session_ref: course.session_ref
          }
          console.log(JSON.stringify(this.query));
          this.getAttendence();
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
  onDateSelect() {
    console.log(this.selectedDate);
    this.getAttendence();
  }
  onSelect(p: any, st: any) {
    const student = p.students.filter((s: any) => s.reg_no == st.reg_no)[0];
    if (student.presence === 'P') {
      student.presence = 'A';
    }
    else {
      student.presence = 'P';
    }

  }
  onSubmit() {
    for (let p of this.attendence.periods) {
      const json = {
        course_code : this.attendence.course_code,
        group_ref:  this.attendence.group_ref,
        session_ref:  this.attendence.session_ref,
        date: this.attendence.date,
        period: p.period,
        students: p.students
      }
      let updationQuery = this.period.filter((pe: any) => pe.value == p.period)[0].disabled;
      if (updationQuery) {
        const req = gql`
      mutation update_attendance($data: create_attendanceInput!) {
        update_attendance(data: $data)
      }
    `;
    this.apollo
    .mutate({
      mutation: req,
      variables: {
        data: json
      }
    }).subscribe(({ data }) => {
      console.log('Updated' + data);
    });

      }
      else {
        const req = gql`
      mutation create_attendance($data: create_attendanceInput!) {
        create_attendance(data: $data)
      }
    `;
    this.apollo
    .mutate({
      mutation: req,
      variables: {
        data: json
      }
    }).subscribe(({ data }) => {
      console.log('Created' + data);
    });
      }
    }

  }

}
