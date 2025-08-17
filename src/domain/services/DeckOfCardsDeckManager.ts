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

// --- Utilities for getNewDeck ---
const fetchNewDeckRequest = (): TE.TaskEither<DeckError, Response> =>
	TE.tryCatch(
		() => fetch(`${API_URL}/new/shuffle/?deck_count=1`),
		(reason) => ({ type: 'DeckError' as const, message: `Failed to fetch new deck: ${reason}` })
	);

const parseDeckResponse = (response: Response): TE.TaskEither<DeckError, DeckResponse> =>
	TE.tryCatch(
		() => response.json() as Promise<DeckResponse>,
		(reason) =>
			({ type: 'DeckError' as const, message: `Failed to parse new deck response: ${reason}` })
	);

const updateDeckState = (data: DeckResponse): TE.TaskEither<DeckError, void> => {
	if (!data.success) {
		return TE.left({ type: 'DeckError' as const, message: 'Failed to get a new deck from API' });
	}
	deckId = data.deck_id;
	remainingCards = data.remaining;
	return TE.right(undefined);
};

const getNewDeck = (): TE.TaskEither<DeckError, void> =>
	pipe(fetchNewDeckRequest(), TE.chain(parseDeckResponse), TE.chain(updateDeckState));

const ensureDeck = (): TE.TaskEither<DeckError, void> => {
	if (deckId) {
		return TE.right(undefined);
	}
	return getNewDeck();
};

// --- Utilities for drawCards ---
const fetchDrawnCardsRequest = (drawCount: number): TE.TaskEither<DeckError, Response> =>
	TE.tryCatch(
		() => fetch(`${API_URL}/${deckId}/draw/?count=${drawCount}`),
		(reason) => ({ type: 'DeckError' as const, message: `Failed to draw cards: ${reason}` })
	);

const parseDrawResponse = (response: Response): TE.TaskEither<DeckError, DrawResponse> =>
	TE.tryCatch(
		() => response.json() as Promise<DrawResponse>,
		(reason) =>
			({
				type: 'DeckError' as const,
				message: `Failed to parse draw cards response: ${reason}`
			})
	);

const updateRemainingAndMapToCards = (data: DrawResponse): TE.TaskEither<DeckError, Card[]> => {
	if (!data.success) {
		return TE.left({
			type: 'DeckError' as const,
			message: 'Failed to draw cards from API'
		});
	}
	remainingCards = data.remaining;
	const cards = data.cards.map((card) => Card.of(card.code));
	return TE.right(cards);
};

const drawCardsPipeline = (count: number) =>
	pipe(
		fetchDrawnCardsRequest(count),
		TE.chain(parseDrawResponse),
		TE.chain(updateRemainingAndMapToCards)
	);

export const DeckOfCardsDeckManager: IDeckManager = {
	drawCards: (count: number) =>
		pipe(
			ensureDeck(),
			TE.chain(() => {
				const drawCount = Math.min(count, remainingCards);
				if (drawCount === 0) {
					return TE.right([]);
				}
				return drawCardsPipeline(drawCount);
			})
		),
	resetDeck: () => getNewDeck()
};