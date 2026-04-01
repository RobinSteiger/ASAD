import { getRandomNumber } from '../utils/rng.js';

export function handleSpin() {
    const result = getRandomNumber(0, 36);
    console.log('Spin result:', result);
    return result;
}