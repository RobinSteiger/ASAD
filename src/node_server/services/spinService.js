import { gameState } from "../repository/gameStateRepository.js";

export function handleSpin() {
  const result = Math.floor(Math.random() * 37);
  gameState.rngResult = result;
  console.log("Spin result:", result);
}
