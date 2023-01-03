import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReminderListComponent } from './reminder-list.component';
import { SharedModule } from '../../modules/shared/shared.module';

@NgModule({
  declarations: [ReminderListComponent],
  exports: [ReminderListComponent],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class ReminderListModule { }
