// /Users/rotour/projects/training/functional-programming/final-project-balatrojs/src/domain/states/GameState.ts
import { assign, fromPromise, setup } from 'xstate';
import type { Card } from '../entities/Card';
import { Hand, type PlayerHand } from '../entities/Hand';
import type { IDeckManager } from '../interfaces/IDeckManager';
import { DefaultGameRules } from '../config/DefaultGameRules';
import { isLeft } from 'fp-ts/Either';
import type { GameEvent } from '../events/GameEvent';
import type { INotifier } from '../interfaces/INotifier';
import { createInMemoryDeckManager } from '../services/InMemoryDeckManager';
import { ConsoleNotifier } from '../services/ConsoleNotifier';
import { PokerService } from '../services/PokerService';
import { ScoringService, type Score } from '../services/ScoringService';

const _GameStateMachine = (deckManager: IDeckManager, notifier: INotifier) =>
	setup({
		types: {
			context: {
				hand: {} as PlayerHand,
				selectedCards: [] as Card[],
				score: 0,
				lastHandScore: null as Score | null
			},
			events: {} as GameEvent
		},
		actors: {
			fillHand: fromPromise(async ({ input }: { input: { hand: PlayerHand } }) => {
				const task = Hand.fill(deckManager)(input.hand);
				const result = await task(); // Execute TaskEither
				if (isLeft(result)) {
					return Promise.reject(result.left.message);
				}
				return result.right;
			}),
			scoreHand: fromPromise(async ({ input }: { input: { cards: Card[] } }) => {
				const handType = PokerService.evaluateHand(input.cards);
				const score = ScoringService.calculateScore(input.cards, handType);
				notifier(`Played ${handType}! Score: ${score.total} (${score.chips} x ${score.multiplier})`);
				return score;
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
			selectedCards: [],
			score: 0,
			lastHandScore: null
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
					input: ({ context }) => ({ hand: context.hand }),
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
					HAND_PLAYED: {
						guard: ({ context }) => context.selectedCards.length > 0,
						target: 'SCORING'
					},
					HAND_DISCARDED: {
						guard: ({ context }) => context.selectedCards.length > 0,
						target: 'FILLING_HAND',
						actions: assign({
							hand: ({ context }) => Hand.removeCards(context.selectedCards)(context.hand),
							selectedCards: []
						})
					}
				}
			},
			SCORING: {
				invoke: {
					src: 'scoreHand',
					input: ({ context }) => ({ cards: context.selectedCards }),
					onDone: {
						target: 'HAND_SCORED',
						actions: assign({
							score: ({ context, event }) => context.score + event.output.total,
							lastHandScore: ({ event }) => event.output,
							hand: ({ context }) => Hand.removeCards(context.selectedCards)(context.hand),
							selectedCards: []
						})
					}
				}
			},
			HAND_SCORED: {
				on: {
					CONTINUE: 'FILLING_HAND'
				}
			}
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