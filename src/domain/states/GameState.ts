// /Users/rotour/projects/training/functional-programming/final-project-balatrojs/src/domain/states/GameState.ts
import { assign, createActor, fromPromise, setup } from 'xstate';
import type { Card } from '../entities/Card';
import { Hand, type PlayerHand } from '../entities/Hand';
import type { IDeckManager } from '../interfaces/IDeckManager';
import { DefaultGameRules } from '../config/DefaultGameRules';
import { isLeft } from 'fp-ts/Either';
import type { GameEvent } from '../events/GameEvent';
import type { INotifier } from '../interfaces/INotifier';
import { createInMemoryDeckManager } from '../services/InMemoryDeckManager';
import { ConsoleNotifier } from '../services/ConsoleNotifier';

const _GameStateMachine = (deckManager: IDeckManager, notifier: INotifier) =>
	setup({
		types: {
			context: {
				hand: {} as PlayerHand,
				selectedCards: [] as Card[]
			},
			events: {} as GameEvent
		},
		actors: {
			fillHand: fromPromise(async () => {
				const hand = Hand.create(DefaultGameRules.handMaxSize);
				const task = Hand.fill(deckManager)(hand);
				const result = await task(); // Execute TaskEither
				if (isLeft(result)) {
					return Promise.reject(result.left.message);
				}
				return result.right;
			})
		},
		actions: {
			notifyMaxCards: () => {
				return notifier(`You cannot select more than ${DefaultGameRules.maxSelectedCards} cards.`);
			},
			notifyCardNotFound: () => notifier('Card not found in hand.'),
			notifyFillHandError: ({ event }) => notifier(`Error: ${event.data}`)
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
						target: 'IDLE',
						actions: 'notifyFillHandError'
					}
				}
			},
			PICKING: {
				on: {
					CARD_SELECTED: [
						{
							guard: ({ context }) =>
								context.selectedCards.length >= DefaultGameRules.maxSelectedCards,
							actions: 'notifyMaxCards'
						},
						{
							guard: ({ context, event }) =>
								!context.hand.cards.some((c) => c.code === event.cardCode),
							actions: 'notifyCardNotFound'
						},
						{
							actions: assign({
								selectedCards: ({ context, event }) => {
									const card = context.hand.cards.find((c) => c.code === event.cardCode)!;
									return [...context.selectedCards, card];
								}
							})
						}
					],
					CARD_DESELECTED: {
						actions: [
							assign({
								selectedCards: ({ context, event }) => {
									return context.selectedCards.filter((card) => card.code !== event.cardCode);
								}
							})
						]
					},
					HAND_PLAYED: {},
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

type GameStateMachineType = 'console';
type GameStateMachineConfig = {
	deckManager?: IDeckManager;
};
export const GameStateMachine = {
	of: (type: GameStateMachineType, config: GameStateMachineConfig = {}) => {
		config.deckManager ??= createInMemoryDeckManager();
		switch (type) {
			case 'console':
				return _GameStateMachine(config.deckManager, ConsoleNotifier());
		}
	}
};
