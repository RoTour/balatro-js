import type { Card } from '../entities/Card';

export type HandDiscarded = {
	type: "HAND_DISCARDED";
	selectedCards: Card[];
}
	