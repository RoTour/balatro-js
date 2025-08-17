// /Users/rotour/projects/training/functional-programming/final-project-balatrojs/src/domain/services/PokerService.test.ts
import { describe, test, expect } from 'vitest';
import { Card } from '../entities/Card';
import { PokerService } from './PokerService';

describe('PokerService:Evaluate Poker Hand', () => {
	test('Should give highest card when nothing else is found', () => {
		const hand: Card[] = [
			Card.of('0C'),
			Card.of('2D'),
			Card.of('3H'),
			Card.of('4S'),
			Card.of('9D')
		];
		const result = PokerService.evaluateHand(hand);
		expect(result).toBe('highest');
	});

	test('Should give pair when two cards have the same value', () => {
		const hand: Card[] = [
			Card.of('2C'),
			Card.of('2D'),
			Card.of('3H'),
			Card.of('4S'),
			Card.of('5D')
		];
		const result = PokerService.evaluateHand(hand);
		expect(result).toBe('pair');
	});

	test('Should give two pairs when two cards have the same value', () => {
		const hand: Card[] = [
			Card.of('2C'),
			Card.of('2D'),
			Card.of('3H'),
			Card.of('3S'),
			Card.of('5D')
		];
		const result = PokerService.evaluateHand(hand);
		expect(result).toBe('two pairs');
	});

	test('Should give three of a kind when three cards have the same value', () => {
		const hand: Card[] = [
			Card.of('2C'),
			Card.of('2D'),
			Card.of('2H'),
			Card.of('3S'),
			Card.of('5D')
		];
		const result = PokerService.evaluateHand(hand);
		expect(result).toBe('three of a kind');
	});

	test('Should give four of a kind when four cards have the same value', () => {
		const hand: Card[] = [
			Card.of('2C'),
			Card.of('2D'),
			Card.of('2H'),
			Card.of('2S'),
			Card.of('5D')
		];
		const result = PokerService.evaluateHand(hand);
		expect(result).toBe('four of a kind');
	});

	test('Should give straight when five cards are in sequence', () => {
		const hand: Card[] = [
			Card.of('2C'),
			Card.of('3D'),
			Card.of('4H'),
			Card.of('5S'),
			Card.of('6D')
		];
		const result = PokerService.evaluateHand(hand);
		expect(result).toBe('straight');
	});

	test('Should give straight when five cards are in sequence with Ace low', () => {
		const hand: Card[] = [
			Card.of('AC'),
			Card.of('2D'),
			Card.of('3H'),
			Card.of('4S'),
			Card.of('5D')
		];
		const result = PokerService.evaluateHand(hand);
		expect(result).toBe('straight');
	});

	test('Should give flush when five cards have the same suit', () => {
		const hand: Card[] = [
			Card.of('2C'),
			Card.of('5C'),
			Card.of('JC'),
			Card.of('AC'),
			Card.of('KC')
		];
		const result = PokerService.evaluateHand(hand);
		expect(result).toBe('flush');
	});

	test('Should give full house when there is a three of a kind and a pair', () => {
		const hand: Card[] = [
			Card.of('2C'),
			Card.of('2D'),
			Card.of('3H'),
			Card.of('3S'),
			Card.of('3D')
		];
		const result = PokerService.evaluateHand(hand);
		expect(result).toBe('full house');
	});

	test('Should give straight flush when five cards are in sequence and have the same suit', () => {
		const hand: Card[] = [
			Card.of('2C'),
			Card.of('3C'),
			Card.of('4C'),
			Card.of('5C'),
			Card.of('6C')
		];
		const result = PokerService.evaluateHand(hand);
		expect(result).toBe('Straight flush');
	});
});
