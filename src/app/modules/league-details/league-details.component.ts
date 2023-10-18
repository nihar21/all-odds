import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericOdds } from 'src/app/core/models/generic-odds.model';
import { CacheService } from 'src/app/core/services/cache-service';
import { SportsService } from 'src/app/core/services/sports-service';

import { Bookmaker } from 'src/app/core/models/bookmaker.model'

import { ALL_MARKET_KEYS, BOOKMAKERS } from 'src/app/core/app.constants'

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
  public masterMarket: string = 'h2h';  // default to 'h2h'
  public allMarketKeys = ALL_MARKET_KEYS;
  public allBookmakers = BOOKMAKERS;

  constructor(private sportsService: SportsService, private cacheService: CacheService,private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
        this.sportTitle = params.get('sportTitle') || '';
        this.leagueKey = params.get('leagueKey') || '';

        if (this.leagueKey) {
            this.sportsService.getAllOdds(this.leagueKey).subscribe(data => {
                this.events = data;
                this.events.sort((a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime());
                this.events.forEach(event => {
                  this.selectedMarket[event.id] = 'h2h';
                });
                this.league = data[0].sport_title;
            });
        }
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

  getOddsForSelectedMarket(event: GenericOdds, bookmakerKey: any, team: string | undefined, marketKey: string): string | number {
    var selectedBookmaker = event.bookmakers.find(b => b.key === bookmakerKey);
    if (!selectedBookmaker) return '-';
    const market = selectedBookmaker.markets.find((m: any) => m.key === marketKey);
    if (!market) return '-';
    const outcome = market.outcomes.find((o: any) => o.name === team);
    if (!outcome) return '-';

    if (outcome.price > 0) {
        return "+" + outcome.price;
    }
    return outcome.price;
  }

  getDisplayValue(event: any, type: 'home' | 'away'): string {
    // For h2h
    if (this.selectedMarket[event.id] === 'h2h') {
        return type === 'home' ? event.home_team : event.away_team;
    }

    // Find the first bookmaker with the selected market
    const bookmaker = event.bookmakers.find((b: any) => b.markets.some((m: any) => m.key === this.selectedMarket[event.id]));
    if (bookmaker) {
        // Find the selected market
        const market = bookmaker.markets.find((m: any) => m.key === this.selectedMarket[event.id]);

        if (this.selectedMarket[event.id] === 'spreads') {
            const outcome = market.outcomes.find((o: any) => o.name === (type === 'home' ? event.home_team : event.away_team));
            if (outcome.point > 0) {
              return `${outcome.name}`;
            }
            return `${outcome.name}`;
           
        }

        if (this.selectedMarket[event.id] === 'totals') {
            const outcome = market.outcomes[type === 'away' ? 0 : 1];  // Assuming 0 is Over and 1 is Under
            return `${outcome.name}`;
        }
    }
    return ''; // Default fallback value
  }

  getFavoredTeamSpread(event: any, bookmakerKey: string): string {
    console.log(event);
    const selectedBookmaker = event.bookmakers.find((b: any) => b.key === bookmakerKey);
    if (!selectedBookmaker) {
      return '-';
    }
    const spreadsMarket = selectedBookmaker.markets.find((market: any) => market.key === 'spreads');
    if (!spreadsMarket) {
      return '-';
    }
    const favoredTeam = spreadsMarket.outcomes.find((outcome: any) => outcome.point < 0);
    if (!favoredTeam) {
      return '-';
    }
    return `${favoredTeam.name} ${favoredTeam.point}`;
  }

  getOverUnderValue(event: any, bookmakerKey: string): string {
    console.log(event);
    const selectedBookmaker = event.bookmakers.find((b: any) => b.key === bookmakerKey);
    if (!selectedBookmaker) {
      return '-';
    }
    const totalsMarket = selectedBookmaker.markets.find((market: any) => market.key === 'totals');
    if (!totalsMarket) {
      return '-';
    }
    return 'O/U: ' + totalsMarket.outcomes[0].point; // Both Over and Under will have the same point
  }

  onMasterMarketChange() {
    this.events.forEach(event => {
        this.selectedMarket[event.id] = this.masterMarket;
    });
    console.log(this.selectedMarket);
    console.log(this.masterMarket)
  }
}