import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { PersonDetailsService } from '../../person-details.service';
import { PersonReferenceModel } from '../../person-reference.model';
import { AcademicsService } from '../academics.service';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit {
  sessions: PersonReferenceModel[];
  queryRef: QueryRef<PersonReferenceModel[], any>;
  category = 'Session';
  constructor(private apollo: Apollo, private router: Router,
              public personDetailsService: PersonDetailsService, private academicsService: AcademicsService) { }

  ngOnInit(): void {
    this.personDetailsService.getDropDown('Session').subscribe((result) => {
      result.sort(function (a: PersonReferenceModel, b: PersonReferenceModel) {
        return b.Ref_Name.localeCompare(a.Ref_Name);
    });
      this.sessions = result;
    });

  }
  onSessionSelect(s: PersonReferenceModel): void{
    this.router.navigate(['/person-details', 'academics', 'course-list', s.Reference_ID]);

  }

}
