import * as E from 'fp-ts/Either';

export type CardSuite = 'Spades' | 'Clovers' | 'Diamonds' | 'Hearts';
export type CardSuiteShort = 'S' | 'C' | 'D' | 'H';
export type CardValue = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0' | 'J' | 'Q' | 'K' | 'A';
export type Card = {
	code: string; // 5S, QH, etc
	value: CardValue; // 2, 3, ... 10, 11
	suite: CardSuite;
};

const getSuiteFromCode = (code: string): E.Either<string, CardSuite> => {
	const firstChar = code.charAt(1).toUpperCase();
	switch (firstChar) {
		case 'S':
			return E.right('Spades');
		case 'C':
			return E.right('Clovers');
		case 'D':
			return E.right('Diamonds');
		case 'H':
			return E.right('Hearts');
		default:
			return E.left(`Invalid code for suite ${code}`);
	}
};

const getValueFromCode = (code: string): E.Either<string, CardValue> => {
	const secondChar = code.charAt(0).toUpperCase();
	const allowedValues: CardValue[] = ['2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K', 'A'];
	if (!allowedValues.includes(secondChar as CardValue)) {
		return E.left(`Invalid code for value ${code}`);
	}
	return E.right(secondChar as CardValue);
};

export const Card = {
	of: (code: string): Card => {
		const suite = getSuiteFromCode(code);
		if (E.isLeft(suite)) {
			throw new Error(suite.left);
		}
		const value = getValueFromCode(code);
		if (E.isLeft(value)) {
			throw new Error(value.left);
		}
		return {
			code: code,
			value: value.right,
			suite: suite.right
		};
	}
};
