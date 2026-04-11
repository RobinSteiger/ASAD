import { gameState } from "../repository/gameStateRepository.js";

// On ne fait PLUS d'import de server.js ici !
export function startTimer(broadcast) {
  const ROUND_DURATION = 15000;
  const RESULT_DELAY = 5000;

  setInterval(() => {
    // 1. Tirage
    gameState.rngResult = Math.floor(Math.random() * 37);
    console.log("🎲 Spin result:", gameState.rngResult);
    broadcast(); // On appelle la fonction passée en paramètre

    // 2. Reset
    setTimeout(() => {
      gameState.rngResult = null;
      gameState.tableState = [];
      console.log("--- 🔓 NEW ROUND STARTED ---");
      broadcast();
    }, RESULT_DELAY);
  }, ROUND_DURATION);
}
