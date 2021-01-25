import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {Apollo, QueryRef} from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  constructor(private apollo: Apollo, private router: Router) {
    this.loginForm = new FormGroup({});
   }
  hide = true;
  ngOnInit(): void {
    this.loginForm = new FormGroup({
      uname: new FormControl('', []),
      password: new FormControl('', [])
    });
  }
  onLogin(): void {
    console.log(this.loginForm.value.uname);
    const req = gql`
    query auth_login($data: user_infoQueryInput!) {
      auth_login(data: $data) {
        token
        Person_ID
      }
    }
    `;
    this.apollo
      .watchQuery({
        query: req,
        variables: {
          data: {
            username: +this.loginForm.value.uname,
            password: this.loginForm.value.password
          }
        }
      }).valueChanges.subscribe((result: any) => {
        console.log(result.data.auth_login.token);
        localStorage.setItem('token', result.data.auth_login.token);
        localStorage.setItem('Person_ID', result.data.auth_login.Person_ID);
        this.apollo.client.clearStore();
        this.router.navigateByUrl('person-details');

    });
  }
}
