import type { HandPlayed } from './HandPlayed';
import type { HandDiscarded } from './HandDiscarded';

export type RoundStarted = {
	type: 'ROUND_STARTED';
};

export type CardSelected = {
	type: 'CARD_SELECTED';
	cardCode: string;
};

export type CardDeselected = {
	type: 'CARD_DESELECTED';
	cardCode: string;
};

export type GameEvent = RoundStarted | HandPlayed | HandDiscarded | CardSelected | CardDeselected;
