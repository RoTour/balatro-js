// /Users/rotour/projects/training/functional-programming/final-project-balatrojs/src/domain/interfaces/IDeckManager.ts
import type { Card } from '../entities/Card';
import type { TaskEither } from 'fp-ts/TaskEither';

export type DeckError = {
	type: 'DeckError';
	message: string;
};

export type IDeckManager = {
	drawCards: (count: number) => TaskEither<DeckError, Card[]>;
	resetDeck: () => TaskEither<DeckError, void>;
};
