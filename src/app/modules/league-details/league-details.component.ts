import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericOdds } from 'src/app/core/models/generic-odds.model';
import { CacheService } from 'src/app/core/services/cache-service';
import { SportsService } from 'src/app/core/services/sports-service';

@Component({
  selector: 'app-sport-detail',
  templateUrl: './league-details.component.html',
  styleUrls: ['./league-details.component.css']
})
export class LeagueDetailsComponent implements OnInit {
  public sportTitle: string = '';
  public leagueKey: string = '';
  public odds: GenericOdds[] = [];

  constructor(private sportsService: SportsService, private cacheService: CacheService,private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
        this.sportTitle = params.get('sportTitle') || '';
        this.leagueKey = params.get('leagueKey') || '';

        if (this.leagueKey) {
            this.sportsService.getAllOdds(this.leagueKey).subscribe(data => {
                this.odds = data;
            });
        }
        console.log(this.odds)
    });
  }
}