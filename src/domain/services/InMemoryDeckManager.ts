// /Users/rotour/projects/training/functional-programming/final-project-balatrojs/src/domain/services/InMemoryDeckManager.ts
import type { IDeckManager, DeckError } from '../interfaces/IDeckManager';
import { Card } from '../entities/Card';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

export type InMemoryDeckManagerConfig = {
	deck: Card[];
};

const createDefaultDeck = (): Card[] => {
	const suits: string[] = ['S', 'H', 'D', 'C'];
	const values: string[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K'];
	const cards: Card[] = [];
	for (const suit of suits) {
		for (const value of values) {
			cards.push(Card.of(`${value}${suit}`));
		}
	}
	return cards;
};

const defaultConfig: InMemoryDeckManagerConfig = {
	deck: createDefaultDeck()
};

export const createInMemoryDeckManager = (
	config: Partial<InMemoryDeckManagerConfig> = {}
): IDeckManager => {
	const finalConfig = { ...defaultConfig, ...config };
	let currentDeck: Card[] = [];
	let initialized = false;

	const shuffle = (deck: Card[]): Card[] => {
		const shuffled = [...deck];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	};

	const resetDeck = (): TE.TaskEither<DeckError, void> => {
		return TE.tryCatch(
			async () => {
				currentDeck = shuffle([...finalConfig.deck]);
				initialized = true;
			},
			(reason) => ({ type: 'DeckError' as const, message: `Failed to reset deck: ${reason}` })
		);
	};

	const ensureDeck = (): TE.TaskEither<DeckError, void> => {
		if (initialized) {
			return TE.right(undefined);
		}
		return resetDeck();
	};

	const drawCards = (count: number): TE.TaskEither<DeckError, Card[]> => {
		return pipe(
			ensureDeck(),
			TE.chain(() =>
				TE.tryCatch(
					async () => {
						const drawCount = Math.min(count, currentDeck.length);
						return currentDeck.splice(0, drawCount);
					},
					(reason) =>
						({ type: 'DeckError' as const, message: `Failed to draw cards: ${reason}` })
				)
			)
		);
	};

	return {
		resetDeck,
		drawCards
	};
};