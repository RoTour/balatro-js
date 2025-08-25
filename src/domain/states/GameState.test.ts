// /Users/rotour/projects/training/functional-programming/final-project-balatrojs/src/domain/states/GameState.test.ts
import { describe, test, expect } from 'vitest';
import { createActor } from 'xstate';
import { waitFor } from 'xstate';
import { GameStateMachine } from './GameState';
import { createInMemoryDeckManager } from '../services/InMemoryDeckManager';
import { DefaultGameRules } from '../config/DefaultGameRules';

describe('GameState: Game flow', () => {
	test('Should fill the hand when a round starts', async () => {
		// Arrange
		const deckManager = createInMemoryDeckManager();
		const machine = GameStateMachine.of('console', { deckManager });
		const actor = createActor(machine).start();

		// Act
		actor.send({ type: 'ROUND_STARTED' });

		// Wait for the machine to finish filling the hand and settle into the PICKING state
		const finalState = await waitFor(actor, (state) => state.matches('PICKING'));

		// Assert
		expect(finalState.context.hand.cards).toHaveLength(DefaultGameRules.handMaxSize);
	});
	test('Player should be able to select a card', async () => {
		// Arrange
		const deckManager = createInMemoryDeckManager();
		const machine = GameStateMachine.of('console', { deckManager });
		const actor = createActor(machine).start();

		// Act
		actor.send({ type: 'ROUND_STARTED' });

		// Wait for the machine to finish filling the hand and settle into the PICKING state
		await waitFor(actor, (state) => state.matches('PICKING'));
		const firstCard = actor.getSnapshot().context.hand.cards[0];
		actor.send({ type: 'CARD_SELECTED', cardCode: firstCard.code });

		// Assert
		expect(actor.getSnapshot().context.selectedCards).toHaveLength(1);
	});
	test('Player should be able to deselect a card', async () => {
		// Arrange
		const deckManager = createInMemoryDeckManager();
		const machine = GameStateMachine.of('console', { deckManager });
		const actor = createActor(machine).start();

		// Act
		actor.send({ type: 'ROUND_STARTED' });

		// Wait for the machine to finish filling the hand and settle into the PICKING state
		await waitFor(actor, (state) => state.matches('PICKING'));
		const firstCard = actor.getSnapshot().context.hand.cards[0];
		actor.send({ type: 'CARD_SELECTED', cardCode: firstCard.code });
		actor.send({ type: 'CARD_DESELECTED', cardCode: firstCard.code });

		// Assert
		expect(actor.getSnapshot().context.selectedCards).toHaveLength(0);
	});
	test('Player should be able to select 5 cards at most', async () => {
		// Arrange
		const deckManager = createInMemoryDeckManager();
		const machine = GameStateMachine.of('console', { deckManager });
		const actor = createActor(machine).start();

		// Act
		actor.send({ type: 'ROUND_STARTED' });

		// Wait for the machine to finish filling the hand and settle into the PICKING state
		await waitFor(actor, (state) => state.matches('PICKING'));
		const firstCard = actor.getSnapshot().context.hand.cards[0];
		actor.send({ type: 'CARD_SELECTED', cardCode: firstCard.code });
		actor.send({ type: 'CARD_SELECTED', cardCode: firstCard.code });
		actor.send({ type: 'CARD_SELECTED', cardCode: firstCard.code });
		actor.send({ type: 'CARD_SELECTED', cardCode: firstCard.code });
		actor.send({ type: 'CARD_SELECTED', cardCode: firstCard.code });
		actor.send({ type: 'CARD_SELECTED', cardCode: firstCard.code });

		// Assert
		expect(actor.getSnapshot().context.selectedCards).toHaveLength(5);
	});
});
