import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_KEY } from 'src/environments/environment';
import { Observable, forkJoin} from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  weatherBaseUrl = `https://api.openweathermap.org/data/2.5/forecast/daily?`;


  constructor(
    private http: HttpClient
  ) {}

  /**
   * Return the forecast for one city based on the day given
   * @param {String} countryCode
   * @param {String} cityName
   * @param {String} date YYYY-MM-DD format
   * @returns {Observable<any>}
   */
  getWeatherInformation(countryCode: string, cityName: string, date: String): Observable<any> {

    const query = `${this.weatherBaseUrl}q=${cityName},${countryCode}&date=${date}&units=metric&appid=${API_KEY}`;
    return this.http.get(query).pipe(

      catchError( err => {
        const query = `${this.weatherBaseUrl}q=${cityName}&date=${date}&units=metric&appid=${API_KEY}`;
        return this.http.get(query)

      })

    )
  }


  /**
   * Return an Observable with a the forecast by the date given for a cities group.
   * @param {Array<{cityName: string, countryCode: string}>} countryCodeAndCitiesName
   * @param {String } date YYYY-MM-DD format
   * @returns {Observable<any>}
   */
  getWeatherInformationByGroupCity(countryCodeAndCitiesName: {cityName: string, countryCode: string}[], date: String): Observable<any>{

    const weatherObservables = countryCodeAndCitiesName.map(element => {

      return this.getWeatherInformation(element.countryCode, element.cityName, date);

    });

    return forkJoin(weatherObservables);

  }
}
