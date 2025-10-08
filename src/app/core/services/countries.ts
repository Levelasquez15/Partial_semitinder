import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CountryResponse {
  error: boolean;
  msg: string;
  data: { name: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  private apiUrl = 'https://countriesnow.space/api/v0.1/countries/positions';

  constructor(private http: HttpClient) {}

  getCountries(): Observable<CountryResponse> {
    return this.http.get<CountryResponse>(this.apiUrl);
  }
}