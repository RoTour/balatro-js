import type { INotifier } from '../interfaces/INotifier';

export const ConsoleNotifier = (): INotifier => {
	return (message) => {
		console.log(`Notification: [${message}]`);
	}
};
