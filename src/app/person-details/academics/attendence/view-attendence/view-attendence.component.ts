import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-view-attendence',
  templateUrl: './view-attendence.component.html',
  styleUrls: ['./view-attendence.component.scss']
})
export class ViewAttendenceComponent implements OnInit {
  date = new Date('12/12/2020');
  students = [
    {
      cattend_id: 1,
      reg_no: 2017503037,
      presense: true
    },
    {
      cattend_id: 2,
      reg_no: 2017503038,
      presense: true
    },
    {
      cattend_id: 3,
      reg_no: 2017503039,
      presense: true
    },
    {
      cattend_id: 4,
      reg_no: 2017503040,
      presense: false
    },
    {
      cattend_id: 5,
      reg_no: 2017503041,
      presense: true
    },
    {
      cattend_id: 6,
      reg_no: 2017503042,
      presense: true
    }
  ]
  constructor() { }

  ngOnInit(): void {
  }
  onSubmit() {
    console.log(this.students);
  }

}
