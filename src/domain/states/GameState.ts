import { assign, createActor, setup } from 'xstate';
import type { Card } from '../entities/Card';
import { type PlayerHand } from '../entities/Hand';
import type { IDeckManager } from '../interfaces/IDeckManager';

export const GameStateMachine = (deckManager: IDeckManager) =>
	setup({
		types: {
			context: {
				hand: {} as PlayerHand,
				selectedCards: [] as Card[]
			}
		}
	}).createMachine({
		context: {
			hand: {} as PlayerHand,
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

export const getStateActor =
	(deckManager: IDeckManager) =>
	(subscribers: (() => void)[] = []) => {
		const actor = createActor(GameStateMachine(deckManager));
		subscribers.forEach((subscriber) => actor.subscribe(subscriber));
		actor.start();
		return { actor, stopActor: () => actor.stop() };
	};
