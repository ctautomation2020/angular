import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AwardsComponent } from './awards/awards.component';
import { EducationComponent } from './education/education.component';
import { ExperienceComponent } from './experience/experience.component';

import { PersonDetailsComponent} from './person-details.component';
import { PersonComponent } from './person/person.component';
import {PublicationComponent} from './publication/publication.component';

const routes: Routes = [
  {
    path: '',
    component: PersonDetailsComponent,
    children: [
      {
        path: 'awards',
        component: AwardsComponent
      },
      {
        path: 'experience',
        component: ExperienceComponent
      },
      {
        path: 'publication',
        component: PublicationComponent
      },
      {
        path: 'person',
        component: PersonComponent
      },
      {
        path: 'education',
        component: EducationComponent
      },
      {
        path: 'academics',
        loadChildren: () => import('./academics/academics.module').then(m => m.AcademicsModule )
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
  })
export class PersonDetailsRoutingModule {

}
