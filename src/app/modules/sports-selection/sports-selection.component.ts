import { Component, OnInit } from '@angular/core';
import { SportsService } from '../../core/services/sports-service';
import { SportsDataService } from 'src/app/core/services/sports-data-service';
import { Sport } from '../../core/models/sports.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sports-selection',
  templateUrl: './sports-selection.component.html',
  styleUrls: ['./sports-selection.component.css']
})
export class SportsSelectionComponent implements OnInit {
  // An example list of sports; this can be fetched from an API
  public sportsList: Sport[] = [];
  public uniqueSports: string[] = [];

  constructor(private sportsService: SportsService, private sportsDataService: SportsDataService, private router: Router) {}

  ngOnInit(): void {
    this.getSportsList();
  }

  getSportsList(): void {
    this.sportsService.getSportsList().subscribe(
      (sports: Sport[]) => {
        this.sportsList = sports;
        this.uniqueSports = Array.from(new Set(this.sportsList.map(sport => sport.group)));
        console.log(this.sportsList)
        // this.sportsDataService.setSportsData(sports);
      },
      (error) => {
        // Handle error
        console.error('Error fetching sports list:', error);
      }
    );
  }

  goToSport(sport: string): void {
    console.log(`You selected ${sport}`);
    this.router.navigate(['/sport', sport]);
    // Additional logic to handle the selection
  }
}
