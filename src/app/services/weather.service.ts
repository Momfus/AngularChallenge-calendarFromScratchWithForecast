import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  getWeatherInformation(city: string) {
    return {
      city,
      weatherInfo: 'here',
    };
  }
}
