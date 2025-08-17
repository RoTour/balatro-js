// /Users/rotour/projects/training/functional-programming/final-project-balatrojs/src/domain/states/GameState.ts
import { assign, createActor, fromPromise, setup } from 'xstate';
import type { Card } from '../entities/Card';
import { Hand, type PlayerHand } from '../entities/Hand';
import type { IDeckManager } from '../interfaces/IDeckManager';
import { DefaultGameRules } from '../config/DefaultGameRules';
import { isLeft } from 'fp-ts/Either';
import type { GameEvent } from '../events/GameEvent';

export const GameStateMachine = (deckManager: IDeckManager) =>
	setup({
		types: {
			context: {
				hand: {} as PlayerHand,
				selectedCards: {} as Card[],
			},
			events: {} as GameEvent,
		},
		actors: {
			fillHand: fromPromise(async () => {
				const hand = Hand.create(DefaultGameRules.handMaxSize);
				const task = Hand.fill(deckManager)(hand);
				const result = await task(); // Execute TaskEither
				if (isLeft(result)) {
					return Promise.reject(result.left);
				}
				return result.right;
			})
		}
	}).createMachine({
		context: {
			hand: Hand.create(DefaultGameRules.handMaxSize),
			selectedCards: []
		},
		initial: 'IDLE',
		states: {
			IDLE: {
				on: {
					ROUND_STARTED: {
						target: 'FILLING_HAND'
					}
				}
			},
			FILLING_HAND: {
				invoke: {
					src: 'fillHand',
					onDone: {
						target: 'PICKING',
						actions: assign({
							hand: ({ event }) => event.output
						})
					},
					onError: {
						// TODO: Go to a proper error state
						target: 'IDLE'
					}
				}
			},
			PICKING: {
				on: {
					CARD_SELECTED: {
						actions: [
							assign({
								selectedCards: ({ context, event }) => {
									if (context.selectedCards.length >= DefaultGameRules.maxSelectedCards) {
										return context.selectedCards;
									}
									const card = context.hand.cards.find((card) => card.code === event.cardCode);
									if (!card) {
										return context.selectedCards;
									}
									return [...context.selectedCards, card];
								}
							})
						]
					},
					CARD_DESELECTED: {
						actions: [
							assign({
								selectedCards: ({ context, event }) => {
									return context.selectedCards.filter((card) => card.code !== event.cardCode)
								}
							})
						]
					},
					HAND_PLAYED: {

					},
					HAND_DISCARDED: {
						actions: [
							assign({
								selectedCards: []
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