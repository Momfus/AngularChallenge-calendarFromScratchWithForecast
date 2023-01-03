import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Reminder } from '../interfaces/reminder.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  // reminders: Reminder[] = [];

  // Example data (I could use a JSON server to fake this data (without a real backend))
  // This is only to show a initial state (another way to test is to save in a session storage)
  reminders: Reminder[] = [
    {
      "description": "Test 1",
      "dateTime": new Date('2022-12-01T03:00:00.000Z'),
      "time": "01:43",
      "country": {
        id: 1,
        iso2: "AR",
        name : "Argentina"
      },
      "city": {
        id: 1117,
        iso2: "12",
        name : "Mendoza"
      },
      "id": "a65e2848-6af5-4b39-bdc5-ad17d7ed50d5"
    },
    {
      "description": "Test 0",
      "dateTime": new Date('2022-12-01T03:00:00.000Z'),
      "time": "01:40",
      "country": {
        id: 1,
        iso2: "AF",
        name : "Afghanistan"
      },
      "city": {
        id: 1117,
        iso2: "12",
        name : "Tébessa"
      },
      "id": "28264315-0cb9-4139-8fb9-5e452e5a5356"
    },
    {
      "description": "Test 3",
      "dateTime": new Date('2023-01-01T03:00:00.000Z'),
      "time": "05:48",
      "country": {
        id: 1,
        iso2: "AF",
        name : "Afghanistan"
      },
      "city": {
        id: 1117,
        iso2: "12",
        name : "Tébessa"
      },
      "id": "c095b0da-1050-4438-a31d-2ae779f827f2"
    },
    {
      "description": "Test 4",
      "dateTime": new Date('2023-01-01T03:00:00.000Z'),
      "time": "13:48",
      "country": {
        id: 1,
        iso2: "AF",
        name : "Afghanistan"
      },
      "city": {
        id: 1117,
        iso2: "12",
        name : "Tébessa"
      },
      "id": "c095b0da-1050-4438-a31d-2ae779f827fa"
    },
  ];

  // loadingCounter: number = 0; // TODO: Add an http interceptor to get the count of loading request

  constructor() { }

  /**
   * Create a new reminder
   * @param {Reminder} newReminder
   * @returns {Observable<Reminder>}
   */
  create(newReminder: Reminder): Observable<Reminder> {
    this.reminders.push(newReminder)
    return of(newReminder);
  }

  /**
   * Edit an existing reminder.
   * @param {Reminder}updatedReminder
   * @returns {Observable<boolean}
   */
  edit(updatedReminder: Reminder): Observable<boolean> {

    const index = this.reminders.findIndex(reminder => reminder.id === updatedReminder.id);

    if (index !== -1) {
      this.reminders[index] = updatedReminder;
      return of(true);
    }

    return of(false);
  }

  /**
   * Delete an existing reminder
   * @param {string} reminderId
   * @returns {Observable<boolean>}
   */
  delete(reminderId: string): Observable<boolean> {

    const index = this.reminders.findIndex(reminder => reminder.id === reminderId);

    if (index !== -1) {
      this.reminders.splice(index, 1);
      return of(true);
    }

    return throwError(`Reminder with id ${reminderId} not found`);
  }

  /**
   * Return all the reminders
   * @returns {Observable<Reminder[]>}
   */
  getAll(): Observable<Reminder[]> {
    return of(this.reminders);
  }

  /**
   * Return an erray of reminders for an specific day
   * @param {number} day
   * @param {number} month
   * @param {number} year
   * @param {boolean} sortData
   * @returns Observable<Reminder[]>
   */
  getByDay(day: number, month: number, year: number, sortData: boolean = false): Observable<Reminder[]> {
    let reminders = this.reminders.filter(reminder => reminder.dateTime.getDate() === day
                                                        && reminder.dateTime.getMonth() === month
                                                        && reminder.dateTime.getFullYear() === year);

    reminders = this.sortByTimeString(reminders);
    return of(reminders);
  }

  /**
   * Return an erray of reminders for an specific month
   * @param {number} month
   * @param {number} year
   * @returns {Observable<Reminder[]>}
   */
  getByMonth(month: number, year: number): Observable<Reminder[]> {
    const reminders = this.reminders.filter(reminder => reminder.dateTime.getMonth() === month
                                                        && reminder.dateTime.getFullYear() === year);

    return of(reminders);

  }

  /**
   * Return an erray of reminders for an specific year
   * @param {number} year
   * @returns {Observable<Reminder[]>}
   */
  getByYear(year: number): Observable<Reminder[]> {
    const reminders = this.reminders.filter(reminder => reminder.dateTime.getFullYear() === year);
    return of(reminders);
  }

  // Helpers

  /**
   * Each reminder have the time as an string, this sort the reminder list given by that attribute.
   * @param {Array<Reminder>}reminderList
   * @returns
   */
  sortByTimeString(reminderList: Reminder[]) {
    return reminderList.sort((a, b) => {

      // First, get the hours and minutes for each reminder
      const aTime = a.time.split(':');
      const bTime = b.time.split(':');

      // Then, convert them to numbers so we can compare them
      const aHours = parseInt(aTime[0], 10);
      const aMinutes = parseInt(aTime[1], 10);
      const bHours = parseInt(bTime[0], 10);
      const bMinutes = parseInt(bTime[1], 10);

       // Finally, compare the hours and minutes for each reminder
      if (aHours < bHours || (aHours === bHours && aMinutes < bMinutes)) {
        return -1;
      } else if (aHours > bHours || (aHours === bHours && aMinutes > bMinutes)) {
        return 1;
      } else {
        return 0;
      }
    });
  }

}
