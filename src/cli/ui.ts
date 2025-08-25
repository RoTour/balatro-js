// /Users/rotour/projects/training/functional-programming/final-project-balatrojs/src/cli/ui.ts
import type { Card } from '../domain/entities/Card';
import type { PlayerHand } from '../domain/entities/Hand';
import chalk from 'chalk';
import figlet from 'figlet';
import boxen from 'boxen';

const suitColor = (suit: Card['suite']) => {
	switch (suit) {
		case 'Hearts':
		case 'Diamonds':
			return chalk.red;
		case 'Spades':
		case 'Clovers':
			return chalk.white;
	}
};

export const displayTitle = async () => {
	const title = await new Promise((resolve, reject) => {
		figlet('Balatro JS', (err, data) => {
			if (err) {
				return reject(err);
			}
			resolve(data);
		});
	});
	console.log(chalk.cyan(title));
};

export const displayHand = (hand: PlayerHand, selectedCards: Card[]) => {
	if (hand.cards.length === 0) {
		console.log(chalk.gray('Your hand is empty.'));
		return;
	}

	const cardDisplays = hand.cards.map((card) => {
		const color = suitColor(card.suite);
		const isSelected = selectedCards.some((sc) => sc.code === card.code);
		const selectionIndicator = isSelected ? chalk.green(' [X]') : chalk.gray(' [ ]');
		const cardArt = `${card.code}${selectionIndicator}`;

		return boxen(color(cardArt), {
			padding: 1,
			margin: 1,
			borderStyle: 'round',
			borderColor: isSelected ? 'green' : 'gray'
		});
	});

	// This is a simple way to display cards side-by-side in the console.
	// It splits each boxed card into lines and then joins them horizontally.
	const lines: string[][] = cardDisplays.map((display) => display.split('\n'));
	const height = Math.max(...lines.map((l) => l.length));

	for (let i = 0; i < height; i++) {
		let line = '';
		for (const cardLines of lines) {
			line += (cardLines[i] || '').padEnd(20);
		}
		console.log(line);
	}
};

export const displayInfo = (message: string) => {
	console.log(chalk.yellow(message));
};

export const displayError = (message: string) => {
	console.log(boxen(chalk.red(message), { title: 'Error', padding: 1 }));
};
