import type { Card } from './Card';

export type PlayerHand = {
	cards: Card[],
	maxSize: number;
}