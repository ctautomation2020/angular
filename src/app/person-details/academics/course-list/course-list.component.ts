import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AcademicsService } from '../academics.service';
import { Apollo, QueryRef } from 'apollo-angular';
import { CourseListModel } from './course-list.model';
import { PersonDetailsService } from '../../person-details.service';
import { Title } from '@angular/platform-browser';
import { PersonReferenceModel } from '../../person-reference.model';
@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['../academics.component.scss']
})
export class CourseListComponent implements OnInit {
  courseList: CourseListModel[] = [];
  courseCodes: any;
  subjAllotId: number;
  session: PersonReferenceModel;
  queryRef: QueryRef<any, any>;
  constructor(private router: Router, private activatedRoute: ActivatedRoute,
              private academicsService: AcademicsService, private personDetails: PersonDetailsService, private title: Title) {
                this.title.setTitle('Course Features');
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      const reference_id = +params['reference_id'];
      this.academicsService.getSession(reference_id).subscribe((result: any) => {
        if (result.length == 0) {
          this.router.navigate(['/person-details', 'academics']);
        }
        else {
          this.session = result[0];
          const query = {
            staff_id: this.personDetails.getPersonID(),
            session_ref: reference_id
          }
          this.academicsService.getStaffCourses(query).subscribe((courses:any) => {
            this.courseCodes = JSON.parse(JSON.stringify(courses));

          console.log(this.session);

          for (const x of this.courseCodes) {
            this.academicsService.getCourse(x.course_code).subscribe((course) => {
              course.sallot_id = x.sallot_id;
              this.courseList.push(course);
            })
        }
          });
        }
      });
   });
  }
  findKeyWord(str: string): string {
    const strArray = str.trim().split(' ');
    const key = strArray[0][0] + strArray[strArray.length - 1][0];
    return key;
  }
  onCourseSelect(c: CourseListModel): void{
    this.router.navigate(['/person-details', 'academics', 'course-features', c.sallot_id ]);

  }

}
