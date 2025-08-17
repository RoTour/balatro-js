import { describe, test, expect } from 'vitest';
import { getStateActor } from './GameState';

const createSUT = () => {
	const { actor } = getStateActor();
	return {
		state: actor
	}
}

describe("GameState:Game flow", () => {
	test("Should draw hand when round start", () => {
		const { state } = createSUT();
		state.send({ type: 'ROUND_START' });
	})
})