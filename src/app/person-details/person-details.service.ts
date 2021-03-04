import { Injectable } from '@angular/core';
import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class PersonDetailsService {
  private Person_ID = parseInt(localStorage.getItem('Person_ID')!);
  constructor(private apollo: Apollo) { }
  getPersonID() {
    return this.Person_ID;
  }
  getDropDown(str: string) {
    const req = gql`
      query personReference($data: Person_Reference_Input) {

        personReference(data: $data){
          Reference_ID
          Category
          Ref_Name
          Description
        }

      }`;

    return this.apollo.watchQuery({
        query: req,
        variables: {
          data: {
            Category: str
          }
        }
      })
      .valueChanges.pipe(map((result: any) =>
      JSON.parse(JSON.stringify(result.data['personReference']))
      ));
  }

}
