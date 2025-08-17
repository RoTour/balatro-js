// /Users/rotour/projects/training/functional-programming/final-project-balatrojs/src/domain/services/DeckOfCardsDeckManager.ts
import type { IDeckManager, DeckError } from '../interfaces/IDeckManager';
import { Card } from '../entities/Card';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

const API_URL = 'https://deckofcards.raltech.school/api/deck';

type DeckResponse = {
	success: boolean;
	deck_id: string;
	shuffled: boolean;
	remaining: number;
};

type DrawResponse = {
	success: boolean;
	cards: {
		code: string;
		image: string;
		images: {
			svg: string;
			png: string;
		};
		value: string;
		suit: string;
	}[];
	remaining: number;
};

let deckId: string | null = null;
let remainingCards: number = 0;

const getNewDeck = (): TE.TaskEither<DeckError, void> =>
	pipe(
		TE.tryCatch(
			() => fetch(`${API_URL}/new/shuffle/?deck_count=1`),
			(reason) => ({ type: 'DeckError' as const, message: `Failed to fetch new deck: ${reason}` })
		),
		TE.chain((response) =>
			TE.tryCatch(
				() => response.json() as Promise<DeckResponse>,
				(reason) => ({
					type: 'DeckError' as const,
					message: `Failed to parse new deck response: ${reason}`
				})
			)
		),
		TE.chain((data) => {
			if (!data.success) {
				return TE.left({
					type: 'DeckError' as const,
					message: 'Failed to get a new deck from API'
				});
			}
			deckId = data.deck_id;
			remainingCards = data.remaining;
			return TE.right(undefined);
		})
	);

const ensureDeck = (): TE.TaskEither<DeckError, void> => {
	if (deckId) {
		return TE.right(undefined);
	}
	return getNewDeck();
};

export const DeckOfCardsDeckManager: IDeckManager = {
	drawCards: (count: number) =>
		pipe(
			ensureDeck(),
			TE.chain(() => {
				const drawCount = Math.min(count, remainingCards);
				if (drawCount === 0) {
					return TE.right([]);
				}
				return pipe(
					TE.tryCatch(
						() => fetch(`${API_URL}/${deckId}/draw/?count=${drawCount}`),
						(reason) => ({ type: 'DeckError' as const, message: `Failed to draw cards: ${reason}` })
					),
					TE.chain((response) =>
						TE.tryCatch(
							() => response.json() as Promise<DrawResponse>,
							(reason) => ({
								type: 'DeckError' as const,
								message: `Failed to parse draw cards response: ${reason}`
							})
						)
					),
					TE.chain((data) => {
						if (!data.success) {
							return TE.left({
								type: 'DeckError' as const,
								message: 'Failed to draw cards from API'
							});
						}
						remainingCards = data.remaining;
						const cards = data.cards.map((card) => Card.of(card.code));
						return TE.right(cards);
					})
				);
			})
		),
	resetDeck: () => getNewDeck()
};
