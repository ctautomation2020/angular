import { NgModule } from '@angular/core';
import { GraphQLModule } from './graphql/graphql.module';
import { MaterialModule } from './material/material.module';
import { ConfirmBoxComponent } from './confirm-box/confirm-box.component';
import { AlertBoxComponent } from './alert-box/alert-box.component';
import { CommonModule } from "@angular/common";
@NgModule({
  declarations: [
    ConfirmBoxComponent,
    AlertBoxComponent
  ],
  imports: [
    GraphQLModule,
    MaterialModule,
    CommonModule
  ],
  exports: [
    GraphQLModule,
    MaterialModule
  ],
})
export class SharedModule {
}
