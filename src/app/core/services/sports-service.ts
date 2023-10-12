import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of, tap } from 'rxjs';
import { Sport } from '../models/sports.model';
import { GenericOdds } from '../models/generic-odds.model';
import { Region } from '../enums/region.enum';
import { Market } from '../enums/market.enum';
import { OddsFormat } from '../enums/odds-format.enum';
import { CacheService } from './cache-service';

@Injectable({
  providedIn: 'root'
})
export class SportsService {

  constructor(
    private apiService: ApiService,
    private cacheService: CacheService
  ) { }

  getSportsList(): Observable<Sport[]> {
    const url = 'https://api.the-odds-api.com/v4/sports/?apiKey=b4bfd1cbef0039a797cf01b3b62bc2bc'

    return this.cacheService.cacheRequest(url, this.apiService.get<Sport[]>(url));

    // const cacheKey = 'sports-list';

    // // Check if the data is already cached
    // const cachedData = this.cacheService.get(cacheKey);
    // if (cachedData) {
    //   return of(cachedData);
    // }

    // // If not cached, fetch from the API
    // return this.apiService.get<Sport[]>('https://api.the-odds-api.com/v4/sports/?apiKey=b4bfd1cbef0039a797cf01b3b62bc2bc').pipe(
    //   tap(data => {
    //     // Cache the data after fetching
    //     this.cacheService.set(cacheKey, data);
    //   })
    // );
  }

  getAllOdds(sport: string = "upcoming", markets?: Market, regions: Region = Region.US, oddsFormat: OddsFormat = OddsFormat.american): Observable<GenericOdds[]> {
    const url = 'https://api.the-odds-api.com/v4/sports/' + sport + "/odds/?apiKey=b4bfd1cbef0039a797cf01b3b62bc2bc&regions=" + regions + "&oddsFormat=" + oddsFormat + "&markets=h2h,spreads,totals";

    return this.cacheService.cacheRequest(url, this.apiService.get<GenericOdds[]>(url));
    // return this.apiService.get<GenericOdds[]>(url);
  }

}
