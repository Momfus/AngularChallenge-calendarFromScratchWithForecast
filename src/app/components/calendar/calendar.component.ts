import { Component, OnInit } from '@angular/core';
import { Reminder } from 'src/app/interfaces/reminder.model';
import { MatDialog } from '@angular/material/dialog';
import { ReminderFormComponent } from '../reminder-form/reminder-form.component';

import * as moment from 'moment'

import { dayData } from '../../interfaces/dayData.model';

import { CalendarService } from 'src/app/services/calendar.service';
import { ReminderListComponent } from '../reminder-list/reminder-list.component';
import { formatTwoDigitsNumberToString } from '../../helpers/string-helpers';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {


  week: Array<String> = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ]

  // An array with the value of each day with their current name of the week
  monthDaysSelected: dayData[] = [];

  dateSelect: moment.Moment;
  dateValue: moment.Moment;

  remindersMonthSelected: Reminder[];

  constructor(
    private calendarService: CalendarService,
    private matDialog: MatDialog,
  ) { }

  ngOnInit(): void {

    this.loadReminderMonth(moment().month(), moment().year());
    this.getDaysFromDate(moment().month() + 1, moment().year())

  }

  /**
   * Open a modal for the reminder form with some exising data
   * @param {Date} date
   */
  openReminderForm(date: Date = new Date() ): void {
    const dialogRef = this.matDialog.open(ReminderFormComponent, {
      data: {
        date,
        isNew: true
      },
    });

    dialogRef.afterClosed().subscribe(isRefreshNeeded => {
      if( isRefreshNeeded ) {
        this.loadReminderMonth(this.dateSelect.month(), this.dateSelect.year());
        this.getDaysFromDate(this.dateSelect.month() + 1,this.dateSelect.year())
      }
    });

  }

  /**
   * Get the reminders of the current month
   * @param {number } month
   * @param {number} year
   */
  loadReminderMonth(month: number, year: number): void {
    this.calendarService.getByMonth(month, year).subscribe( res => {
      this.remindersMonthSelected = res;
    })
  }


  /**
   * Set the forma of the calendar for the month and year given
   * @param {number} month
   * @param {number} year
   */
  getDaysFromDate(month, year): void {

    month = formatTwoDigitsNumberToString(month);
    const startDate = moment.utc(`${year}-${month}-01T12:00:00`)
    const endDate = startDate.clone().endOf('month')
    this.dateSelect = startDate;

    const diffDays = endDate.diff(startDate, 'days', true) + 1 // + 1 is needed because the startDate doenst count the first day of the month
    const numberDays = Math.round(diffDays);

    const arrayDays = Object.keys([...Array(numberDays)]).map((day: any) => {
      day = parseInt(day) + 1;

      const dayaux = formatTwoDigitsNumberToString(day); // Needed format day for moment.js

      const dayObject = moment(`${year}-${month}-${dayaux}`);
      return {
        name: dayObject.format("dddd"),
        value: day,
        indexWeek: this.wrap(dayObject.isoWeekday() + 1, 1, 7),
        isRemenderHere: this.checkDayInArray(day)
      };


    });

    this.monthDaysSelected = arrayDays;


  }


  /**
   * Change the month selected
   * @param {number} flag 1 = next month; -1 = previous month
   */
  changeMonth(flag): void {

    let dateToChange;
    if (flag < 0) {
      dateToChange = this.dateSelect.clone().subtract(1, "month")
    } else {
      dateToChange = this.dateSelect.clone().add(1, "month");
    }

    this.loadReminderMonth(dateToChange.month(),dateToChange.year());
    this.getDaysFromDate(dateToChange.format("MM"), dateToChange.format("YYYY"));


  }

  /**
   * Show the reminders list or create a new reminder in the date selected
   * @param {dayData} day
   */
  clickOnDay(day: dayData): void {

    if( day.isRemenderHere ){

      this.calendarService.getByDay(day.value, this.dateSelect.month(),  this.dateSelect.year(), true)
        .subscribe( (res: Reminder[]) => {
          this.openReminderDayList(res, day)
        },
        error => console.log(error)
        )

    } else {
      this.openReminderForm(new Date( this.dateSelect.year(), this.dateSelect.month(), day.value) );
    }


  }

  /**
   * Open a modal for the reminder list of the given date
   * @param {Array<Reminder>} reminderList
   * @param {dayData} day
   */
  openReminderDayList( reminderList: Reminder[], day: dayData ) {

    const dialogRef = this.matDialog.open(ReminderListComponent, {
      data: {
        reminderList,
        day,
        dateSelect: this.dateSelect
      },
      maxHeight: '800px',
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(isRefreshNeeded => {
      if( isRefreshNeeded ) {
        this.loadReminderMonth(this.dateSelect.month(), this.dateSelect.year());
        this.getDaysFromDate(this.dateSelect.month() + 1,this.dateSelect.year())
      }
    });

  }

  /// Helpers

  /**
   * Wrap a given value between min and max values (making a "circular wrap value")
   * @param {Number} value
   * @param {Number} min
   * @param {Number} max
   * @returns {Number}
   */
  wrap(value, min, max) {
    return (value < min) ?  (max - min + 1) + value :
                            (value > max ) ? value - (max - min + 1) :
                            value;
  }

  /**
   * Return true if the given number day exists in the current month (and year) selected
   * @param {number} day
   * @param {Array<Reminder>} reminders
   * @returns
   */
  checkDayInArray(day: number): boolean {
    return this.remindersMonthSelected.some(reminder => reminder.dateTime.getDate() === day);
  }


}
