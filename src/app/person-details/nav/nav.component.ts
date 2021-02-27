import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { PersonDetailsService } from '../person-details.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  personName: string;
  Prefix_Ref: number;
  Person_ID: number;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
  Prefix: any;

  constructor(private breakpointObserver: BreakpointObserver, private router: Router, private apollo: Apollo, private personDetailsService: PersonDetailsService) {}
  onLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('Person_ID');

    this.apollo.client.clearStore();
    window.location.replace('');
  }
  ngOnInit() {
    this.Person_ID = this.personDetailsService.getPersonID()
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
}
