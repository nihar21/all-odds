import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Sport } from '../models/sports.model';

@Injectable({
    providedIn: 'root',
  })
  export class SportsDataService {
    private sportsData: Sport[] = [];
    
    setSportsData(data: Sport[]) {
      this.sportsData = data;
    }
    
    getSportData(title: string): Sport[] | undefined {
      return this.sportsData.filter(sport => sport.group === title);
    }
  }