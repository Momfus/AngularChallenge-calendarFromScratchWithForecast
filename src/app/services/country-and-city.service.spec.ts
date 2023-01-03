import { TestBed } from '@angular/core/testing';

import { CountryAndCityService } from './country-and-city.service';

describe('CountryAndCityService', () => {
  let service: CountryAndCityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CountryAndCityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
