// /Users/rotour/projects/training/functional-programming/final-project-balatrojs/src/domain/services/DeckOfCardsDeckManager.int.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { DeckOfCardsDeckManager } from './DeckOfCardsDeckManager';
import { isRight, isLeft } from 'fp-ts/Either';

describe('DeckOfCardsDeckManager Integration Tests', () => {
	// Reset the deck before each test to ensure independence
	beforeEach(async () => {
		const result = await DeckOfCardsDeckManager.resetDeck()();
		if (isLeft(result)) {
			throw new Error('Failed to reset deck in beforeEach');
		}
	});

	test('should draw 5 cards from a new deck', async () => {
		const result = await DeckOfCardsDeckManager.drawCards(5)();

		expect(isRight(result)).toBe(true);
		if (isRight(result)) {
			expect(result.right).toHaveLength(5);
		}
	});

	test('should draw all 52 cards from a new deck', async () => {
		const result = await DeckOfCardsDeckManager.drawCards(52)();

		expect(isRight(result)).toBe(true);
		if (isRight(result)) {
			expect(result.right).toHaveLength(52);
		}
	});

	test('should draw remaining cards if request is larger than what is left', async () => {
		// Draw 50 cards first
		const firstDraw = await DeckOfCardsDeckManager.drawCards(50)();
		expect(isRight(firstDraw)).toBe(true);

		// Try to draw 5, but only 2 are left
		const secondDraw = await DeckOfCardsDeckManager.drawCards(5)();
		expect(isRight(secondDraw)).toBe(true);
		if (isRight(secondDraw)) {
			expect(secondDraw.right).toHaveLength(2);
		}
	});

	test('should draw 0 cards if deck is empty', async () => {
		// Draw all 52 cards
		const firstDraw = await DeckOfCardsDeckManager.drawCards(52)();
		expect(isRight(firstDraw)).toBe(true);

		// Try to draw again
		const secondDraw = await DeckOfCardsDeckManager.drawCards(1)();
		expect(isRight(secondDraw)).toBe(true);
		if (isRight(secondDraw)) {
			expect(secondDraw.right).toHaveLength(0);
		}
	});

	test('resetDeck should create a new deck, allowing to draw 52 cards again', async () => {
		// Draw some cards
		await DeckOfCardsDeckManager.drawCards(10)();

		// Reset the deck
		const resetResult = await DeckOfCardsDeckManager.resetDeck()();
		expect(isRight(resetResult)).toBe(true);

		// Should be able to draw 52 cards now
		const drawResult = await DeckOfCardsDeckManager.drawCards(52)();
		expect(isRight(drawResult)).toBe(true);
		if (isRight(drawResult)) {
			expect(drawResult.right).toHaveLength(52);
		}
	});
});
