import { addBet } from '../repository/gameStateRepository.js';

export function handleBet(bet) {
    addBet(bet);
}