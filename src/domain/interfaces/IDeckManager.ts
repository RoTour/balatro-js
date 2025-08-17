import type { Card } from "../entities/Card";

export type IDeckManager = {
	drawCards: (count: number) => Promise<Card[]>;
	resetDeck: () => Promise<void>;
}