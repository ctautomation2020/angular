import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { AwardsModelComponent } from './awards/awards-model/awards-model.component';
import { AwardsComponent } from './awards/awards.component';
import { EducationModelComponent } from './education/education-model/education-model.component';
import { EducationComponent } from './education/education.component';
import { ExperienceModelComponent } from './experience/experience-model/experience-model.component';
import { ExperienceComponent } from './experience/experience.component';
import { NavComponent } from './nav/nav.component';
import { PersonDetailsRoutingModule } from './person-details-routing.module';
import { PersonDetailsComponent } from './person-details.component';
import { PersonModelComponent } from './person/person-model/person-model.component';
import { PersonComponent } from './person/person.component';
import { PublicationModelComponent } from './publication/publication-model/publication-model.component';
import { PublicationComponent } from './publication/publication.component';
import { AcademicsModule } from './academics/academics.module';
@NgModule({
  declarations: [
    NavComponent,
    PersonDetailsComponent,
    PublicationComponent,
    PublicationModelComponent,
    // ExperienceComponent,
    ExperienceModelComponent,
    AwardsComponent,
    AwardsModelComponent,
    PersonComponent,
    PersonModelComponent,
    EducationComponent,
    EducationModelComponent,
    ExperienceComponent,
    ExperienceComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    PersonDetailsRoutingModule
  ]
})
export class PersonDetailsModule{

}
