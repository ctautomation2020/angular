import { Component, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AcademicsModel } from '../academics.model';
import { AcademicsService } from '../academics.service';
import { AttendenceModel } from './attendence.model';

@Component({
  selector: 'app-attendence',
  templateUrl: './attendence.component.html',
  styleUrls: ['./attendence.component.scss']
})
export class AttendenceComponent implements OnInit {
  selectedDate: Date = new Date();
  selectedPeriods = [];
  period: any = [1,2,3,4,5,6,7,8];
  constructor(private academicsService: AcademicsService, private activatedRoute: ActivatedRoute, private router: Router) { }
  sallot_id: number;
  session: AcademicsModel;
  courseTitle: string;
  students: any;
  searchText: any;
  selectedChoice: string;
  sample(event: any) {
    this.selectedPeriods = event;
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
          const new_query = {
            course_code : course.course_code,
            group_ref: course.group_ref,
            session_ref: course.session_ref
          }
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
  onDateSelect() {
    console.log(this.selectedDate);
  }
}

