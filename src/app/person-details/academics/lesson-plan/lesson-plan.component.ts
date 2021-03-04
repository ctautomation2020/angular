import { Component, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { ConfirmBoxComponent } from 'src/app/shared/confirm-box/confirm-box.component';
import { PersonDetailsService } from '../../person-details.service';

import { AcademicsService } from '../academics.service';
import { LessonPlanModelComponent } from './lesson-plan-model/lesson-plan-model.component';

import json from 'json-keys-sort';
import { LessonPlan, LessonPlanGroup, LessonPlanQuery } from './lesson-plan.model';
import { LessonPlanService } from './lesson-plan.service';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { PersonReferenceModel } from '../../person-reference.model';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-lesson-plan',
  templateUrl: './lesson-plan.component.html',
  styleUrls: ['./lesson-plan.component.scss']
})

export class LessonPlanComponent implements OnInit {
  lessonPlanGroup: LessonPlanGroup[];
  sallot_id: number;
  session: PersonReferenceModel;
  courseTitle: string;
  courseCode: string;
  personName: any;
  Prefix_Ref: any;
  Prefix: any;
  lessonPlan: LessonPlanQuery[];
  courseTopics: any;
  queryRef: QueryRef<LessonPlan[], any>
  query: { course_code: any; group_ref: any; session_ref: any; };
  constructor(public dialog: MatDialog, private personDetailsService: PersonDetailsService, private academicsService: AcademicsService, private apollo: Apollo, private activatedRoute: ActivatedRoute, private router: Router, private dateAdapter: DateAdapter<Date>, public lessonPlanService: LessonPlanService) {
    this.dateAdapter.setLocale('en-GB');
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
          const query = {
            course_code : course.course_code,
            group_ref: course.group_ref,
            session_ref: course.session_ref
          }
          this.courseCode = course.course_code;
          this.query = query;
          this.getStaffDetails();
          const req = gql`
          query course_lessonplan($data: course_lessonplanQueryInput!) {
            course_lessonplan(data: $data) {
              clp_id
              actual_date
              period
              course_ctopic_id
              course_topic {
                topic
              }
              references
            }
            }
          `;
          this.queryRef =  this.apollo.watchQuery({
            query: req,
            variables: {
              data: query
            },
            fetchPolicy: 'no-cache'
          })
          this.queryRef.valueChanges.subscribe((result: any) => {
          this.lessonPlan = JSON.parse(JSON.stringify(result.data.course_lessonplan))
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
                let dates = groupBy(result.data.course_lessonplan, 'actual_date');
                dates = json.sort(dates, true);
                let lessonPlan: LessonPlanGroup[] = [];
                Object.keys(dates).forEach(function(key) {
                  let lesson: LessonPlanGroup = {
                    actual_date: key,
                    hours: dates[key].length,
                    topics: [] as any
                  }
                  let topics = [] as any;
                  for (let t of dates[key]) {
                    let topic: any = t.course_topic.topic;
                    topics.push(topic);
                  }
                  topics = topics.filter((v: string,i: number) => topics.indexOf(v) == i)
                  lesson.topics = topics;
                  lessonPlan.push(lesson);
                });
                console.log(lessonPlan);
                this.lessonPlanGroup = lessonPlan;
          });
          ;
          this.academicsService.getCourseTopics(course.course_code).subscribe((course_topics) => {
            this.courseTopics = course_topics;
            console.log(this.courseTopics);
          })
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
  getStaffDetails() {
    const req = gql`
    query person {
      person {
        Person_ID
        Prefix_Ref
        First_Name
      }
    }
    `;
    this.apollo
      .watchQuery({
        query: req
      }).valueChanges.subscribe(((result: any) => {
        result = JSON.parse(JSON.stringify(result.data.person));
        console.log(result);
        this.personName = result.First_Name
        this.Prefix_Ref = result.Prefix_Ref
        if(this.Prefix_Ref) {
          this.personDetailsService.getDropDown('Prefix').subscribe(result => {
            const id = result.filter((r: any) => r.Reference_ID === this.Prefix_Ref)[0].Ref_Name;
            this.Prefix = id;
            console.log(result);
           });
        }
      }));

  }
  deleteDialog(l: any) {
    const dialogDeleteRef = this.dialog.open(ConfirmBoxComponent, {data: {message: "Do you want to delete?"}});
    dialogDeleteRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
        const req = gql `
        mutation delete_course_lessonplan($data: delete_course_lessonplanInput!) {
          delete_course_lessonplan(data: $data) {
            clp_id
          }
        }
        `;
        this.apollo
    .mutate({
      mutation: req,
      variables: {
        data: {
          clp_id: l.clp_id
        }
      }}).subscribe(({ data }) => {
      this.queryRef.refetch();
    });

      }
    });
  }
  getDate(inputDate: any): Date {
    const temp = parseFloat(inputDate) / 1000;
    const myDate = new Date(0);
    myDate.setUTCSeconds(temp);
    return myDate;
  }
  onEditClass(actual_date: string) {
    const d = this.getDate(actual_date)
    console.log(d);
    this.router.navigate(['/person-details', 'academics', 'lesson-plan', 'lesson-plan-model', this.sallot_id, d.toDateString()]);
  }
  onAddClass() {
    const d = new Date();
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    console.log();
    this.router.navigate(['/person-details', 'academics', 'lesson-plan', 'lesson-plan-model', this.sallot_id, date.toDateString()]);
  }
  pdfHelper() {
    let str = `
    <div style="text-align: center;">
	<table width="616">
		<tbody>
			<tr>
      <td rowspan="2">
<img width="125"  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAM4AAAC8CAYAAAAw9ZEOAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAClISURBVHhe7Z0L3C3V+McjcqnQUSmiKISkIimSSklJVykknBSJQpLc6SZFKd10c+SQVOLoKEmH6IJSQlTILZ2US8mlmP//O+/89nn286657r1nz3v2+n0+v8+735k1a2bWzG/WWs961rOWSCIiImojCiciogGicCIiGiAKJyKiAaJwIiIaIAonIqIBonAiIhogCiciogGicMaMK664IllxxRWTO+64I9sSMRMQhTMm3HzzzcmjH/3oZIkllqjM+fPnZ0dHjBtROGPCfvvtFxRHGU888cQsh4hxIgpnDLj66quTpZdeOiiMMr70pS/NcokYJ6JwxgArhH322Sfbmo+nP/3pfcecccYZ2Z6IcSEKp2V8+MMf7hNBFfzmN79JNthgg94xL3nJS5J///vf2d6IcSAKp0V85CMfSZZccsmeAH7wgx9ke8oxe/bs3nHwH//4R7YnYhyIwmkR73jHO3ov/jHHHJNtrY5ll122TzyjBP2wX//619l/ER5ROC1iJgiHWvDd7353mv/aa6+d/v7gBz+Y7Y0QonAyrL766j2OCl0XDvfOYKw9B3zgAx+YvPe9781SRYCJFg4d7Le//e3TXpRVVlklueaaa5J77703SzkcDFM4w+rj/O9//0v7Xsq3iCeddFJy/fXXZ0dONiZWOLwEb33rW4MviLjnnnsmn/jEJ7IjBkcXhaNmmeUee+yRHHLIIckOO+wwbd/DHvawtPaZ9BpoIoVz5plnpi+AfylCXGqppRq95CF0UTjKT9xxxx2Te+65J93317/+NbnxxhunpRE33HDDNN0kYmKE8+c//zltZviHv/zyyyfPfOYzs1RT4P/HPOYxfenOPffcbG9zdEk4f/nLX5JNN920l99qq62W7ZmOv//972mZQKWHs2bNSv7whz9kqSYLEyGcu+++O9lqq636Hjp85CMfmVx88cVZqn5897vfTVZaaaW+9IOiK8L573//m9YsyutZz3pW8otf/CLbWwzftNt3332zPZOFiRDObbfd1vew4VlnnZU2Q4qwzjrr9B3z8pe/PNvTDMMUDm44TXHffff18oGvfe1rsz3loOa2x0bhLMag9tCDftzjHpdtrYYnPelJfS9K1TENpg38/Oc/T97whjf0HS8OKpwQP/7xj6fnhH/729+yo6bDHsNYTV2ccMIJveOjcBZj2BelrnBowtjji4Tz6U9/OvnoRz+acrnllus7znMUwrHcZZddetfys5/9LMshSc4555y+dE0QhROFU4p//etfqQezjqffc8stt2R7k2S77bZLm3TwIQ95SN+58njttdcmCxcuzHKoDowbHGv5spe9LHgOSzr+ukb6ddr+yU9+Msu5HqJwonAq4fjjj0/N0jafKlxjjTVS/v73v89yGh2++c1v9s4Hl1lmmeA1idReHNMEUTgTKJzDDjss21oP3hSbx4MOOqjHcWLu3LnB6xNf/epXZynrAW+K7bffvpdPFM5iDPvCNJ1BecMNN/TlY/nkJz85dY6sM03AY4sttkj23nvv7L8pHHrooclznvOc5C1veUu2ZQof+tCHkn/+85/Zf/nQNUF7vUxt+NWvfpWlqgdraaQfd+utt2Z7JgsTIRza+AzW6YHjn9YEdLKVx4Mf/OA0X9vfKYM1R8Orrroq25OkzpUvetGLsv+msNdee6Xpttxyy2xLklx44YW945vAi7MOvFl/kjExd3/sscf2HnhT4dx+++3JO9/5zpSYfvPwne98JznqqKPSsSILLxwoIBy8k3/84x9nW+oL5+tf/3p63gsuuCDbMjxcd911ac2qc2O1m2RMjHD4WjJmwUNfeeWVk5/85CfZnuGD/g3nWX/99bMtUygTDv/T8RbqCod+C9vxChC+9a1vDcWn7OSTT+6dF37729/O9kwmJkY4wHZqB/0q/+c//0mtZZCayELCwZUFdx8hJBxiCeBU2UQ4jOILp59+errtsY99bLZlCniBKz2eD1xvXf8y/NqUB3Nzxm346AImSjhALwA87bTTsq318cc//jF57nOfm+aDQCwkHHjkkUdmWxcJhxqPuGoKEbXzzjv3zMdlwqGf9bSnPS3dzhgOOO6449L/CeKBH5oF2z0f9KAHZXur4fDDD+8dSxDFiAkUznnnndd7CR7/+MdnW5vhAx/4QJqPFw5z9fnysy8knOc///np/whI1yKWCQe87nWvS7dLOBp49X2qF77whb186XeJdYWjPGAUzhQmTjiAyWl6EQ444IBsa3187GMf60WtYeKXhXzcioQDdB1iHeFY4sFgseuu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">
</td>
				<td rowspan="2" width="389">
					<p><strong>ANNA UNIVERSITY</strong></p>
					<p><strong>MADRAS INSTITUTE OF TECHNOLOGY CAMPUS</strong></p>
					<p><strong>CHROMEPET, CHENNAI - 600044</strong></p>
					<p><strong>DEPARTMENT OF COMPUTER TECHNOLOGY</strong></p>
				</td>
				<td width="135">
					<p><strong>Year :</strong></p>
					<p><strong>` + this.session.Description + `</strong></p>
				</td>
			</tr>
			<tr>
				<td width="135">
					<p><strong>Sem : ___</strong></p>
				</td>
			</tr>
		</tbody>
	</table>
	<p><strong><u>RECORD OF CLASSWORK</u></strong></p>
	<table>
		<tbody>
			<tr>
				<td width="175" style="background-color:#BFBFBF">
					<p>Name of the Faculty</p>
				</td>
				<td colspan="3" width="441" style="background-color:#BFBFBF">
					<p><strong>`+ this.Prefix + '. ' + this.personName +`</strong></p>
				</td>
			</tr>
			<tr>
				<td width="175">
					<p>Designation</p>
				</td>
				<td colspan="3" width="441">
					<p>Associate Professor</p>
				</td>
			</tr>
			<tr>
				<td width="175">
					<p>Name of the progaramme</p>
				</td>
				<td width="114">
					<p>B.E.</p>
				</td>
				<td width="96">
					<p>Branch</p>
				</td>
				<td width="231">
					<p>COMPUTER SCIENCE ENGINEERING</p>
				</td>
			</tr>
			<tr>
				<td width="175">
					<p>Semester &amp; year</p>
				</td>
				<td width="114">
					<p>4/8, Dec 2019- March 2020</p>
				</td>
				<td width="96">
					<p>No. of students</p>
				</td>
				<td width="231">
					<p>141</p>
				</td>
			</tr>
			<tr>
				<td width="175">
					<p>Subject Code &amp; Name</p>
				</td>
				<td colspan="3" width="441">
					<p><strong>` + this.courseCode + ` - ` + this.courseTitle + `</strong></p>
				</td>
			</tr>
		</tbody>
	</table>
        <br>
	<table width="637">
		<tbody>
			<tr>
				<td width="55" style="background-color:#BFBFBF">
					<p><strong>S. No.</strong></p>
				</td>
				<td width="90" style="background-color:#BFBFBF">
					<p><strong>Date</strong></p>
				</td>
				<td width="72" style="background-color:#BFBFBF">
					<p><strong>No. of periods</strong></p>
				</td>
				<td width="258" style="background-color:#BFBFBF">
					<p><strong>Topics / sub-topics</strong></p>
				</td>
				<td width="84" style="background-color:#BFBFBF">
					<p><strong>Objectives</strong></p>
				</td>
				<td width="78" style="background-color:#BFBFBF">
					<p><strong>Outcomes</strong></p>
				</td>
			</tr>
    `;
    let row = '';
    for (let [i,l] of this.lessonPlanGroup.entries()) {
      row += `
      <tr>
				<td width="55">
					<p>` + +(i+1) + `</p>
				</td>
				<td width="90">
					<p>`+ this.getDateFormat(this.getDate(l.actual_date)) +`</p>
				</td>
				<td width="72">
					<p>` + l.hours + `</p>
				</td>
        <td width="258"><p>
				`;
      for (let [j, t] of l.topics.entries()) {
        row += t ;
        if(j != l.topics.length - 1) {
          row += ' - ';
        }
      }

				row += `</p>
				</td>
        <td width="84">
					<p>1</p>
				</td>
				<td width="78">
					<p>1</p>
				</td>
			</tr>
      `;
    }
    str += row + `
		</tbody>
    </table>
  </div>
    `;
    return str;
  }
  getDateFormat(data: any) {
    var today = new Date(data);
    var dd = new String(today.getDate());

    var mm = new String(today.getMonth()+1);
    var yyyy = today.getFullYear();
    if(+dd < 10)
    {
        dd = '0' + dd;
    }

    if(+mm < 10)
    {
        mm='0'+mm;
    }
    const date = dd+'-'+mm+'-'+yyyy;
    return date;
  }
  generatePDF() {
    const code = this.courseCode;
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
