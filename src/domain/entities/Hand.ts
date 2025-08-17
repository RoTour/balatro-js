// /Users/rotour/projects/training/functional-programming/final-project-balatrojs/src/domain/entities/Hand.ts
import type { Card } from './Card';
import type { IDeckManager, DeckError } from '../interfaces/IDeckManager';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

export type PlayerHand = {
	readonly cards: readonly Card[];
	readonly maxSize: number;
};

export const Hand = {
	create: (maxSize: number): PlayerHand => ({
		cards: [],
		maxSize
	}),

	addCards: (cardsToAdd: readonly Card[]) => (hand: PlayerHand): PlayerHand => ({
		...hand,
		cards: [...hand.cards, ...cardsToAdd]
	}),

	removeCards: (cardsToRemove: readonly Card[]) => (hand: PlayerHand): PlayerHand => ({
		...hand,
		cards: hand.cards.filter((card) => !cardsToRemove.some((c) => c.code === card.code))
	}),

	fill: (deckManager: IDeckManager) => (hand: PlayerHand): TE.TaskEither<DeckError, PlayerHand> => {
		const cardsToDraw = hand.maxSize - hand.cards.length;
		if (cardsToDraw <= 0) {
			return TE.right(hand);
		}

		return pipe(
			deckManager.drawCards(cardsToDraw),
			TE.map((drawnCards) => Hand.addCards(drawnCards)(hand))
		);
	}
};