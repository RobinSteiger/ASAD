import { gameState } from '../repository/gameState.js';

export function handlePayout(result) {
    // Pour chaque mise, calculer le payout et mettre à jour balance
    gameState.bets.forEach(bet => {
        const userId = bet.userId;
        if (!gameState.users[userId]) gameState.users[userId] = 0;

        // Exemple simple: pari sur un numéro exact
        if (bet.number === result) {
            gameState.users[userId] += bet.amount * 35;
        } else {
            gameState.users[userId] -= bet.amount;
        }
    });

    // Reset bets
    gameState.bets = [];
}