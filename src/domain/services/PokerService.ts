import type { Card, CardValue } from '../entities/Card';

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

export const PokerService = {
	evaluateHand: (hand: Card[]): PokerHandType => {
		const valuesInHand = hand.reduce(
			(acc, card) => {
				acc[card.value] = (acc[card.value] || 0) + 1;
				return acc;
			},
			{} as Record<CardValue, number>
		);
		const singlePair = Object.entries(valuesInHand).filter(([, count]) => count === 2).length === 1;
		if (singlePair) return 'pair';

		const twoPairs = Object.entries(valuesInHand).filter(([, count]) => count === 2).length === 2;
		if (twoPairs) return 'two pairs';

		const threeOfAKind = Object.entries(valuesInHand).find(([, count]) => count === 3);
		if (threeOfAKind) return 'three of a kind';

		const fourOfAKind = Object.entries(valuesInHand).find(([, count]) => count === 4);
		if (fourOfAKind) return 'four of a kind';
		

		return 'highest';
	}
};
