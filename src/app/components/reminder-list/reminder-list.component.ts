import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Reminder } from '../../interfaces/reminder.model';
import { CalendarService } from '../../services/calendar.service';
import { dayData } from '../../interfaces/dayData.model';
import { ReminderFormComponent } from '../reminder-form/reminder-form.component';
import { WeatherService } from '../../services/weather.service';
import { formatTwoDigitsNumberToString } from '../../helpers/string-helpers';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reminder-list',
  templateUrl: './reminder-list.component.html',
  styleUrls: ['./reminder-list.component.scss']
})
export class ReminderListComponent implements OnInit {

  dataSource: MatTableDataSource<Reminder>;
  displayedColumns: string[] = ['time', 'description', 'city', 'forecast', 'actions'];
  myDay: dayData;
  myDateSelect: moment.Moment;
  refreshAfterClose: boolean = false;

  isLoading: boolean = false; // Temporal solution --> make a global one with the service and use http interceptor

  constructor(
    private calendarService: CalendarService,
    private weatherService: WeatherService,
    private matDialog: MatDialog,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ReminderListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.myDay = this.data.day;
    this.myDateSelect = this.data.dateSelect;

    this.updateDataSource(false);

  }

  /**
   * Edit a given reminder
   * @param {Reminder} reminder
   */
  editReminder(reminder: Reminder): void {

    const dialogRef = this.matDialog.open(ReminderFormComponent, {
      data: {
        reminder,
        isNew: false
      },
    });

    dialogRef.afterClosed().subscribe(isRefreshNeeded => {
      if( isRefreshNeeded ) {
        this.updateDataSource(true);
      }
    });


  }

  /**
   * Delete a given reminder from the JSON list
   * @param {Reminder} reminder
   */
  deleteReminder(reminder: Reminder): void {

    this.isLoading = true;
    this.calendarService.delete( reminder.id ).subscribe( (res) => {

      this.snackBar.open('Reminder deleted', 'Ok', {
        duration: 2000
      });

      this.isLoading = false;
      this.updateDataSource(true);
    });


    if( this.dataSource.data.length == 0 ) {
      this.closeModal( true );
    }

  }

  /**
   * Close the modal, and set to refresh the calendar in the current month if is needed
   * @param {boolean} needToRefresh
   */
  closeModal(needToRefresh: boolean): void {
    this.dialogRef.close(needToRefresh);
  }

  /**
   * Create a new Reinder for this date for default
   */
  newReminder(): void {

    const date = new Date(this.myDateSelect.year(), this.myDateSelect.month(), this.myDay.value );
    const dialogRef = this.matDialog.open(ReminderFormComponent, {
      data: {
        date,
        isNew: true
      },
    });

    dialogRef.afterClosed().subscribe(isRefreshNeeded => {
      if( isRefreshNeeded ) {
        this.updateDataSource(true);
      }
    });

  }

  /**
   * Get the reminder information refreshed with the weather information for each one
   * @param {boolean} needRefresh
   */
  private updateDataSource(needRefresh: boolean): void {

    this.calendarService.getByDay(this.myDay.value, this.myDateSelect.month(),  this.myDateSelect.year(), true)
      .subscribe( reminders => {
        this.isLoading = true;
        this.refreshAfterClose = needRefresh;
        const countryCodeAndCityNamesNoRepeat = this.getUniqueCityNames(reminders);

        console.log(countryCodeAndCityNamesNoRepeat);

        // Date formate needed for weatherService
        const day = formatTwoDigitsNumberToString(this.myDay.value);
        const month = formatTwoDigitsNumberToString(this.myDateSelect.month() + 1);
        const stringDate = `${this.myDateSelect.year()}-${month}-${day}`

        const forecastNeedToRefresh = reminders.some( reminder => reminder.forecast === undefined );

        if ( !forecastNeedToRefresh && !needRefresh  || reminders.length === 0 ) {
          this.dataSource = new MatTableDataSource(reminders);
          return;
        }

        this.weatherService.getWeatherInformationByGroupCity(countryCodeAndCityNamesNoRepeat, stringDate )
          .subscribe( forecastByCities => {

            reminders
              .filter(reminder => reminder.city && reminder.country)
              .map( (reminder: Reminder) => {

                const forecastCity = forecastByCities.find( element => element.city.name === reminder.city.name).list[0];

                reminder.forecast = {
                  min: forecastCity.temp.min,
                  max: forecastCity.temp.max,
                  humidity: forecastCity.humidity,
                  weather: {
                    type: forecastCity.weather[0].main,
                    description: forecastCity.weather[0].description,
                    icon: `https://openweathermap.org/img/w/${forecastCity.weather[0].icon}.png`
                  }
                }

              })

            this.isLoading = false;
            this.dataSource = new MatTableDataSource(reminders);

          },
          error => console.error(error)
          );



      });

  }


  // Helpers

  /**
   * Get a list without repeat the name and country coide
   * @param {Array<Reminder>} reminders
   * @returns {Array<{cityName: string, countryCode: string}>}
   */
  getUniqueCityNames(reminders: Reminder[]): {cityName: string, countryCode: string}[] {
    let cities = reminders
      .filter(reminder => reminder.city && reminder.country)
      .map(reminder => ({cityName: reminder.city.name, countryCode: reminder.country.iso2}));
    cities = cities.filter((city, index) => cities.findIndex(c => c.cityName === city.cityName && c.countryCode === city.countryCode) === index);

    return cities;
  }

}
