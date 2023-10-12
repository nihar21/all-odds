import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericOdds } from 'src/app/core/models/generic-odds.model';
import { CacheService } from 'src/app/core/services/cache-service';
import { SportsService } from 'src/app/core/services/sports-service';

import { Bookmaker } from 'src/app/core/models/bookmaker.model'

@Component({
  selector: 'app-sport-detail',
  templateUrl: './league-details.component.html',
  styleUrls: ['./league-details.component.css']
})
export class LeagueDetailsComponent implements OnInit {
  public sportTitle: string = '';
  public leagueKey: string = '';
  public league: string = '';
  public events: GenericOdds[] = [];
  public selectedMarket: { [eventId: string]: string } = {};

  constructor(private sportsService: SportsService, private cacheService: CacheService,private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
        this.sportTitle = params.get('sportTitle') || '';
        this.leagueKey = params.get('leagueKey') || '';

        if (this.leagueKey) {
            this.sportsService.getAllOdds(this.leagueKey).subscribe(data => {
                this.events = data;
                this.events.sort((a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime());
                this.league = data[0].sport_title;
            });
        }
        this.events.forEach(event => {
            this.selectedMarket[event.id] = 'h2h';
          });
        console.log(this.events)
    });
  }

  getOdds(bookmaker: Bookmaker, team: string | undefined): string {
    const market = bookmaker.markets.find((m: { key: string; }) => m.key === "h2h");
    if (market) {
      const outcome = market.outcomes.find((o: { name: string; }) => o.name === team);
      if (outcome) {
        let price = "";
        if (outcome.price > 0) {
            price = '+';
        }
        return price + outcome.price.toString();
      }
      return '-';
    }
    return '-';
  }

  getSelectedMarketOutcomes(event: any): any[] {
    const selectedKey = this.selectedMarket[event.id] || 'h2h'; // default to h2h
    const market = event.bookmakers[0].markets.find((m: any) => m.key === selectedKey);
    return market ? market.outcomes : [];
  }

  getOddsForSelectedMarket(bookmaker: any, team: string, marketKey: string): string | number {
    const market = bookmaker.markets.find((m: any) => m.key === marketKey);
    if (market) {
        const outcome = market.outcomes.find((o: any) => o.name === team);
        if (outcome) {
            if (outcome.price > 0) {
                return "+" + outcome.price;
            }
            return outcome.price;
        }
        return '-';
    }
    return '-';
  }

  getPointValue(event: any, marketKey: string): number {
    // Find the first bookmaker with the given market
    const bookmaker = event.bookmakers.find((b: any) => b.markets.some((m: any) => m.key === marketKey));
    if (bookmaker) {
        // Find the desired market in the bookmaker's markets
        const market = bookmaker.markets.find((m: any) => m.key === marketKey);
        // Return the point value from the first outcome of that market
        return market?.outcomes[0]?.point;
    }
    return 0; // Return a default value if not found
  }
  
}