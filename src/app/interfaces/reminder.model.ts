import { Country } from './country.mode';
import { City } from './city.model';

export interface Reminder {
  description: string;
  dateTime: Date;
  time: string;
  color?: string;
  country?: Country;
  city?: City;
  id: string;
  forecast?: {
    min: number;
    max: number;
    humidity: number;
    weather: {
      type: string;
      description: string;
      icon: string;
    }
  }
}
