import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Reminder } from 'src/app/interfaces/reminder.model';
import { v4 as uuidv4 } from 'uuid';
import { CalendarService } from '../../services/calendar.service';
import { Country } from '../../interfaces/country.mode';
import { City } from '../../interfaces/city.model';
import { CountryAndCityService } from '../../services/country-and-city.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reminder-form',
  templateUrl: './reminder-form.component.html',
  styleUrls: ['./reminder-form.component.scss']
})
export class ReminderFormComponent implements OnInit {

  reminderForm: FormGroup;

  reminderId: string;
  listcountry!: Country[];
  countrySelected!: Country;
  listCity!: City[];
  citySelected!: City;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<ReminderFormComponent>,
    private calendarService: CalendarService,
    private countryAndCityService: CountryAndCityService,
    private snackBar: MatSnackBar
  ) {

  }

  ngOnInit(): void {
    this.getCountryList();
    this.createForm();

  }

  onCountrySelected( myCountry: Country) {

    this.countrySelected = this.listcountry.find( country => country.iso2 === myCountry.iso2 );
    this.countryAndCityService.getStateOfSelectedCountry(myCountry.iso2).subscribe(data=>{
      this.listCity = data;
      this.reminderForm.controls.city.setValidators(Validators.required);
      this.reminderForm.controls.city.updateValueAndValidity();
    })

  }


  onCitySelected( myCity: City) {
    this.citySelected = this.listCity.find( city => city.iso2 === myCity.iso2 );
  }

  getCountryList(){
    this.countryAndCityService.getCountry().subscribe(data=>{
      this.listcountry = data

      if( !this.data.isNew) {
        this.reminderForm.get('country').setValue(this.data.reminder.country);
        this.reminderForm.get('city').setValue(this.data.reminder.city);
      }
    })
  }

  createForm() {

    let description = '',
        dateTime = this.data.date,
        time = '12:00',
        country = '',
        city = '';

    if( !this.data.isNew) {
      description = this.data.reminder.description;
      dateTime = new Date(this.data.reminder.dateTime);
      time = this.data.reminder.time;
      country = this.data.reminder.country;
      city = this.data.reminder.city;
      this.reminderId = this.data.reminder.id;
    }

    this.reminderForm = this.formBuilder.group({
      description: [description, [Validators.required, Validators.maxLength(30)]],
      dateTime: [dateTime, Validators.required],
      time: [time, [Validators.required]],
      country: [country],
      city: [city]
    });

    if( this.reminderForm.value.country ) {
      this.reminderForm.controls.city.setValidators(Validators.required);
      this.reminderForm.controls.city.updateValueAndValidity();
    }
  }

  onSubmit() {
    if( this.reminderForm.invalid ) {
      const msg = 'Some data for the reminder is invalid'
      console.error(msg);

      this.snackBar.open(msg, 'Ok', {
        duration: 2000
      });

      return;
    }

    const myReminder: Reminder = this.reminderForm.value;

    if( this.data.isNew ) {

      myReminder.id =  uuidv4();

      this.calendarService.create(myReminder)
        .subscribe( () => {

          this.snackBar.open('New reminder added', 'Ok', {
            duration: 2000
          });

          this.dialogRef.close(true);
        },
        error => console.error(error)
        );

    } else {

      myReminder.id = this.reminderId

      this.calendarService.edit(myReminder)
        .subscribe( () => {

          this.snackBar.open('Reminder edited', 'Ok', {
            duration: 2000
          });


          this.dialogRef.close(true);
        },
        error => console.error(error)
        );

    }


  }
}
