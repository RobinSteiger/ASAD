import { gameState } from "../repository/gameStateRepository.js";

export function handlePayout() {
  if (gameState.rngResult === null) return;

  gameState.tableState.forEach((bet) => {
    // Initializing user if not exists
    if (!gameState.users[bet.userId]) {
      gameState.users[bet.userId] = 1000;
    }

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
