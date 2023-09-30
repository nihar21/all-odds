import { Market } from "./market.model";

export interface Bookmaker {
    key: string;
    title: string;
    last_update: Date;
    markets: Market[];
  }