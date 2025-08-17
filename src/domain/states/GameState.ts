import { assign, createActor, setup } from 'xstate';
import type { Card } from '../entities/Card';

export const GameStateMachine = setup({
	types: {
		context: {
			playerCards: [] as Card[],
			selectedCards: [] as Card[]
		}
	}
}).createMachine({
	context: {
		playerCards: [],
		selectedCards: []
	},
	states: {
		IDLE: {
			on: {
				ROUND_START: {
					target: 'PICKING',
					actions: [
						() => {
							
						}
					]
				}
			}
		},
		PICKING: {
			on: {
				SELECT_CARD: {
					actions: [
						assign({
							selectedCards: ({ context, event }) => [...context.selectedCards, event.card]
						})
					]
				},
				DESELECT_CARD: {
					actions: [
						assign({
							selectedCards: ({ context, event }) =>
								context.selectedCards.filter((card) => card.code !== event.card.code)
						})
					]
				},
				HAND: {},
				DISCARD: {
					actions: [
						assign({
							selectedCards: ({ context }) => []
						})
					]
				}
			}
		},
		SCORING: {},
		SHOP: {}
	}
});

export const getStateActor = (subscribers: (() => void)[] = []) => {
	const actor = createActor(GameStateMachine);
	subscribers.forEach((subscriber) => actor.subscribe(subscriber));
	actor.start();
	return { actor, stopActor: () => actor.stop() };
};
