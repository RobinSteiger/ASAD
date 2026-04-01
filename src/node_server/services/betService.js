import { gameState } from '../repository/gameState.js';

export function handleBet(bet, ws) {
    // Ajouter mise à la liste des mises
    gameState.bets.push(bet);

    // Mettre à jour tableState si nécessaire
    gameState.tableState.push(bet);

    // Répondre au joueur
    ws.send(JSON.stringify({ type: 'BET_CONFIRMED', data: bet }));
}