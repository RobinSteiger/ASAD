import { gameState } from '../repository/gameStateRepository.js';

export function handlePayout() {
    if (gameState.rngResult === null) return;

    gameState.tableState.forEach(bet => {
        if (bet.number === gameState.rngResult) {
            // 35x payout roulette straight
            gameState.users[bet.userId] += bet.amount * 35;
        } else {
            gameState.users[bet.userId] -= bet.amount;
        }
    });

    // Reset bets after spin
    gameState.tableState = [];
}