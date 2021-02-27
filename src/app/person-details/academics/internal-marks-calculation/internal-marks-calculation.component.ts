import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PersonDetailsService } from '../../person-details.service';
import { AcademicsModel } from '../academics.model';
import { AcademicsService } from '../academics.service';
import { Apollo, gql, QueryRef } from 'apollo-angular';
@Component({
  selector: 'app-internal-marks-calculation',
  templateUrl: './internal-marks-calculation.component.html',
  styleUrls: ['./internal-marks-calculation.component.scss']
})
export class InternalMarksCalculationComponent implements OnInit {

  selectedChoice = [];
  midSem: number;
  courseTitle: string;
  assignList: any;
  assessList: any;
  internalMarks: { type: number; number: any; weightage: number; }[];
  list: any = [];
  courseCode: any;
  query: { session_ref: any; group_ref: any; course_code: any; };
  constructor(private academicsService: AcademicsService, private router: Router, private activatedRoute: ActivatedRoute, private personDetails: PersonDetailsService, private apollo: Apollo) { }
  sallot_id: number;
  session: AcademicsModel;
  type = [
    {
      type: 2,
      name: "Assignment"
    },
    {
      type: 1,
      name: "Assessment"
    },
    {
      type: 3,
      name: "Mid Semester"
    }
  ]
  getType(type: number) {
    return this.type.filter((t) => t.type === type)[0].name;
  }
  onChoiceChange(event: any) {
    this.internalMarks = []
    for(let e of event) {
      const mark = {
        type: e.type,
        number: e.number,
        weightage: e.weightage
      }
      this.internalMarks.push(mark);
    }
  }
  onMidSemChange() {
    this.list = [];
    const assessments = this.assessList.filter((a: any) => a!= this.midSem);
    for (let a of assessments) {
      const assess = {
        type: 2,
        number: a
      }
      this.list.push(assess);
    }
    for (let a of this.assignList) {
      const assign = {
        type: 1,
        number: a
      }
      this.list.push(assign);
    }

  }
  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.sallot_id = +params['sallot_id'];
      const query = {
       sallot_id: this.sallot_id
      }
      this.academicsService.getCourseDetails(query).subscribe((result: any) => {
        if(result == null) {
          this.router.navigate(['/person-details', 'academics']);
        }
        else {
         this.academicsService.getSession(result.session_ref).subscribe((session) => {
           this.session = session[0];
         })
         this.academicsService.getCourse(result.course_code).subscribe((course: any) => {
           this.courseTitle = course.title;
         })
         const newQuery = {
           session_ref: result.session_ref,
           group_ref: result.group_ref,
           course_code: result.course_code
         }
         this.query = newQuery;
         this.academicsService.getAssignmentList(newQuery).subscribe((assessList: any) => {
           this.assignList = assessList.sort();
         });
         this.academicsService.getAssessmentList(newQuery).subscribe((assessList: any) => {
          this.assessList = assessList.sort();
        });
        }
      })
     })
  }
  onSubmit() {
    const midSem = {
      type: 3,
      number: this.midSem,
      weightage: 100
    }
    this.internalMarks.push(midSem);
    console.log(this.internalMarks);
    const req = gql`
            mutation create_course_cacomp($data: create_course_cacompInput!) {
              create_course_cacomp(data: $data)
            }
            `;
            this.apollo.mutate({
              mutation: req,
              variables: {
                data: {
                  course_code: this.query.course_code,
                  session_ref: this.query.session_ref,
                  group_ref: this.query.group_ref,
                  compques: this.internalMarks
                }
              }
            }).subscribe((data: any) => {
              console.log(data);
            });
  }

}
