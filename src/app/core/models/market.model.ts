import { Outcome } from "./outcome.model";

export interface Market {
    key: string;
    last_update: Date;
    outcomes: Outcome[];
}