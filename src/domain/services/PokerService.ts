// /Users/rotour/projects/training/functional-programming/final-project-balatrojs/src/domain/services/PokerService.ts
import { cardValueMap, type Card, type CardValue } from '../entities/Card';

export type PokerHandType =
	| 'highest'
	| 'pair'
	| 'two pairs'
	| 'three of a kind'
	| 'straight' // 2, 3, 4, 5
	| 'flush' // all from same suit
	| 'full house' // three of a kind + pair
	| 'four of a kind'
	| 'Straight flush'; // Straight all from same suit

// ### Cards codes:
// Card value
// 2, 3, 4, 5, 6, 7, 8, 9, 0, J, Q, K, A
// Cards suite:
// S (Spades), C (Clovers), D (Diamonds), H (Hearts)

const isFlush = (hand: Card[]): boolean => {
	if (hand.length !== 5) return false;
	const firstSuite = hand[0].suite;
	return hand.every((card) => card.suite === firstSuite);
};

const isStraight = (hand: Card[]): boolean => {
	if (hand.length !== 5) return false;
	const values = hand.map((card) => cardValueMap[card.value]);
	const uniqueValues = [...new Set(values)].sort((a, b) => a - b);
	if (uniqueValues.length !== 5) return false;

	const isNormalStraight = uniqueValues[4] - uniqueValues[0] === 4;
	const isAceLowStraight =
		uniqueValues[0] === 2 &&
		uniqueValues[1] === 3 &&
		uniqueValues[2] === 4 &&
		uniqueValues[3] === 5 &&
		uniqueValues[4] === 14;

	return isNormalStraight || isAceLowStraight;
};

export const PokerService = {
	evaluateHand: (hand: Card[]): PokerHandType => {
		const valuesInHand = hand.reduce(
			(acc, card) => {
				acc[card.value] = (acc[card.value] || 0) + 1;
				return acc;
			},
			{} as Record<CardValue, number>
		);

		const flush = isFlush(hand);
		const straight = isStraight(hand);

		if (straight && flush) return 'Straight flush';

		const counts = Object.values(valuesInHand);
		const fourOfAKind = counts.includes(4);
		if (fourOfAKind) return 'four of a kind';

		const threeOfAKind = counts.includes(3);
		const pair = counts.includes(2);
		if (threeOfAKind && pair) return 'full house';

		if (flush) return 'flush';
		if (straight) return 'straight';

		if (threeOfAKind) return 'three of a kind';

		const pairs = counts.filter((c) => c === 2).length;
		if (pairs === 2) return 'two pairs';
		if (pairs === 1) return 'pair';

		return 'highest';
	}
};
