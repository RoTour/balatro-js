// /Users/rotour/projects/training/functional-programming/final-project-balatrojs/src/domain/events/GameEvent.ts

export type GameEvent =
	| { type: 'ROUND_STARTED' }
	| { type: 'CARD_SELECTED'; cardCode: string }
	| { type: 'CARD_DESELECTED'; cardCode: string }
	| { type: 'HAND_PLAYED' }
	| { type: 'HAND_DISCARDED' }
	| { type: 'CONTINUE' };