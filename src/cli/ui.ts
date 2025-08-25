// /Users/rotour/projects/training/functional-programming/final-project-balatrojs/src/cli/ui.ts
import type { Card } from '../domain/entities/Card';
import type { PlayerHand } from '../domain/entities/Hand';
import chalk from 'chalk';
import figlet from 'figlet';
import boxen from 'boxen';
import stringWidth from 'string-width';

import type { Score } from '../domain/services/ScoringService';

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

export const displayGameInfo = (score: number, lastHandScore: Score | null) => {
	let scoreInfo = `Total Score: ${chalk.bold.green(score)}`;
	if (lastHandScore) {
		const { chips, multiplier, total } = lastHandScore;
		scoreInfo += `    Last Hand: ${chalk.bold.yellow(total)} (Chips: ${chips} x Multiplier: ${multiplier})`;
	}
	console.log(boxen(scoreInfo, { padding: 1, borderStyle: 'double', borderColor: 'cyan' }));
	console.log(); // Add a blank line for spacing
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

		// IMPORTANT: Margin is removed from boxen and handled manually for horizontal alignment.
		return boxen(color(cardArt), {
			padding: 1,
			borderStyle: 'round',
			borderColor: isSelected ? 'green' : 'gray'
		});
	});

	// --- Responsive Card Layout ---
	if (cardDisplays.length === 0) return;

	// Add a manual margin (space) between cards
	const horizontalMargin = '  ';

	// Determine the visual width of a card from the first rendered card's first line
	const cardWidth = stringWidth(cardDisplays[0].split('\n')[0]);
	const terminalWidth = process.stdout.columns || 80; // Fallback to 80 columns
	const cardsPerRow = Math.max(1, Math.floor(terminalWidth / (cardWidth + stringWidth(horizontalMargin))));

	// Chunk the cards into rows based on how many can fit
	const rowsOfCards = [];
	for (let i = 0; i < cardDisplays.length; i += cardsPerRow) {
		rowsOfCards.push(cardDisplays.slice(i, i + cardsPerRow));
	}

	// Render each row of cards
	for (const row of rowsOfCards) {
		const lines: string[][] = row.map((display) => display.split('\n'));
		const height = Math.max(...lines.map((l) => l.length));

		for (let i = 0; i < height; i++) {
			let line = '';
			for (const cardLines of lines) {
				const part = cardLines[i] || '';
				const visualWidth = stringWidth(part);
				const padding = ' '.repeat(Math.max(0, cardWidth - visualWidth));
				line += part + padding + horizontalMargin;
			}
			console.log(line);
		}
		console.log(); // Add a blank line between rows of cards
	}
};

export const displayInfo = (message: string) => {
	console.log(chalk.yellow(message));
};

export const displayError = (message: string) => {
	console.log(boxen(chalk.red(message), { title: 'Error', padding: 1 }));
};