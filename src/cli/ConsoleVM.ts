// /Users/rotour/projects/training/functional-programming/final-project-balatrojs/src/cli/ConsoleVM.ts
import inquirer from 'inquirer';
import { createActor, type Actor } from 'xstate';
import { GameStateMachine } from '../domain/states/GameState';
import * as UI from './ui';

export class ConsoleVM {
	private actor: Actor<ReturnType<typeof GameStateMachine.of>>;
	private isPrompting = false;

	constructor() {
		this.actor = createActor(GameStateMachine.of('console')).start();
	}

	public async start() {
		console.clear();
		await UI.displayTitle();

		this.actor.subscribe((snapshot) => {
			console.clear();
			UI.displayGameInfo(snapshot.context.score, snapshot.context.lastHandScore);
			UI.displayHand(snapshot.context.hand, snapshot.context.selectedCards);
			console.log(`\nState: ${snapshot.value}`); // Log current state for debugging

			if (
				snapshot.matches('IDLE') ||
				snapshot.matches('PICKING') ||
				snapshot.matches('HAND_SCORED')
			) {
				this.promptUserForAction();
			}
		});

		// Initial prompt
		this.promptUserForAction();
	}

	private async promptUserForAction() {
		if (this.isPrompting) return;
		this.isPrompting = true;

		const snapshot = this.actor.getSnapshot();

		try {
			if (snapshot.matches('IDLE')) {
				const { action } = await inquirer.prompt([
					{
						type: 'list',
						name: 'action',
						message: 'What would you like to do?',
						choices: ['Start Round', 'Exit']
					}
				]);

				if (action === 'Start Round') {
					this.actor.send({ type: 'ROUND_STARTED' });
				} else if (action === 'Exit') {
					process.exit(0);
				}
			} else if (snapshot.matches('PICKING')) {
				const { cardsToToggle } = await inquirer.prompt([
					{
						type: 'checkbox',
						name: 'cardsToToggle',
						message: 'Select cards to play or discard. Press <space> to select.',
						choices: snapshot.context.hand.cards.map((card) => ({
							name: card.code,
							value: card.code,
							checked: snapshot.context.selectedCards.some((sc) => sc.code === card.code)
						}))
					}
				]);

				// Sync selections with the state machine
				const currentSelection = snapshot.context.selectedCards.map((c) => c.code);
				const newSelection = cardsToToggle as string[];

				const toDeselect = currentSelection.filter((c) => !newSelection.includes(c));
				const toSelect = newSelection.filter((c) => !currentSelection.includes(c));

				toDeselect.forEach((cardCode) => this.actor.send({ type: 'CARD_DESELECTED', cardCode }));
				toSelect.forEach((cardCode) => this.actor.send({ type: 'CARD_SELECTED', cardCode }));

				const { action } = await inquirer.prompt([
					{
						type: 'list',
						name: 'action',
						message: 'What next?',
						choices: ['Play Selected Cards', 'Discard Selected Cards', 'Done Selecting']
					}
				]);

				if (action === 'Play Selected Cards') {
					this.actor.send({ type: 'HAND_PLAYED' });
				} else if (action === 'Discard Selected Cards') {
					this.actor.send({ type: 'HAND_DISCARDED' });
				}
			} else if (snapshot.matches('HAND_SCORED')) {
				await inquirer.prompt([
					{
						type: 'input',
						name: 'continue',
						message: 'Press <Enter> to continue...'
					}
				]);
				this.actor.send({ type: 'CONTINUE' });
			}
		} finally {
			this.isPrompting = false;
		}
	}
}
