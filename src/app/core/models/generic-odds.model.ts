import { Bookmaker } from "./bookmaker.model";

export interface GenericOdds {
    id: string;
    sport_key: string;
    sport_title: string;
    commence_time: Date;
    home_team?: string;
    away_team?: string;
    has_outrights: boolean;
    bookmakers: Bookmaker[];
  }