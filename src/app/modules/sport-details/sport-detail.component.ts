import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SportsService } from 'src/app/core/services/sports-service';
import { Sport } from 'src/app/core/models/sports.model';

@Component({
  selector: 'app-sport-detail',
  templateUrl: './sport-detail.component.html',
  styleUrls: ['./sport-detail.component.css']
})
export class SportDetailComponent implements OnInit {
  public sportTitle: string | null = null;
  public sportsData: Sport[] | undefined = [];

  constructor(private sportsService: SportsService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.sportTitle = params.get('sportTitle');
      if (this.sportTitle) {
        this.sportsService.getSportsList().subscribe(data => {
          this.sportsData = data.filter(sport => sport.group === this.sportTitle);
        });
        // this.sportsData = this.sportsDataService.getSportData(this.sportTitle);
        console.log(this.sportsData)
      }
    });
  }

  goToLeagueOdds(league: string): void {
    console.log(`You selected ${league}`);
    this.router.navigate(['/league', league]);
  }
}