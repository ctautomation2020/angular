import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-person-details',
  templateUrl: './person-details.component.html',
  styleUrls: ['./person-details.component.scss']
})
export class PersonDetailsComponent implements OnInit {

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
  }
  ngOnInit(): void {
    console.log(localStorage.getItem('token'));
  }
}
