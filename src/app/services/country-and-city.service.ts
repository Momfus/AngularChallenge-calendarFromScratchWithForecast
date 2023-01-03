import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Country } from '../interfaces/country.mode';

// TODO: Make an observable that load all the country at one and only reload the cities if the country is changed (lazyload)

@Injectable({
  providedIn: 'root'
})
export class CountryAndCityService {

  constructor(private httpclient: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({
        'Content-type': 'application/json',
        'X-CSCAPI-KEY': 'MGZMRlZLbkZ0SmNiOGkxQzBlREFLYjBKdlZZU1BnRmlRbGI3N2lvVg=='
    })
    };

    /**
     * Get a list of country with their data
     * @returns {Observable<Country[]>}
     */
  getCountry(): Observable<Country[]>{
    return this.httpclient.get<Country[]>('https://api.countrystatecity.in/v1/countries', {headers: this.httpOptions.headers})
  }

  /**
   * Get an list of cities from an specific country
   * @param {string} countryIso
   * @returns Observable<any>
   */
  getStateOfSelectedCountry(countryIso: string): Observable<any>{
    return this.httpclient.get(`https://api.countrystatecity.in/v1/countries/${countryIso}/states`,{headers: this.httpOptions.headers} )
  }

}
