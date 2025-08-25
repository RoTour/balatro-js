// /Users/rotour/projects/training/functional-programming/final-project-balatrojs/src/domain/services/ScoringService.ts
import type { Card } from '../entities/Card';
import type { PokerHandType } from './PokerService';

export type Score = {
	chips: number;
	multiplier: number;
	total: number;
};

// Base values for each hand type. These can be modified by game rules, jokers, etc.
const handChips: Record<PokerHandType, number> = {
	highest: 5,
	pair: 10,
	'two pairs': 20,
	'three of a kind': 30,
	straight: 30,
	flush: 35,
	'full house': 40,
	'four of a kind': 60,
	'Straight flush': 100
};

const handMultipliers: Record<PokerHandType, number> = {
	highest: 1,
	pair: 2,
	'two pairs': 2,
	'three of a kind': 3,
	straight: 4,
	flush: 4,
	'full house': 4,
	'four of a kind': 7,
	'Straight flush': 8
};

const cardValueChips: Record<string, number> = {
	'2': 2,
	'3': 3,
	'4': 4,
	'5': 5,
	'6': 6,
	'7': 7,
	'8': 8,
	'9': 9,
	'0': 10, // 10
	J: 10,
	Q: 10,
	K: 10,
	A: 11
};

const calculateScore = (playedCards: Card[], handType: PokerHandType): Score => {
	// 1. Calculate base chips from the hand type (e.g., Pair, Flush)
	const baseChips = handChips[handType];

	// 2. Add chips from the values of the cards played
	const cardChips = playedCards.reduce((acc, card) => acc + cardValueChips[card.value], 0);

	const totalChips = baseChips + cardChips;
	const multiplier = handMultipliers[handType];

	return {
		chips: totalChips,
		multiplier,
		total: totalChips * multiplier
	};
};

export const ScoringService = {
	calculateScore
};
