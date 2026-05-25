// Represents the available roulette board types
export type BoardType = 'european' | 'mini';

export interface User {
  id: string;
  name: string;
  balance: number;
  // Player selected board
  boardType?: BoardType;
  lastWin?: number;

}

export interface Bet {
  userId: string;
  number: number;
  amount: number;
  // Board where the bet was placed
  boardType: BoardType;
}

// Winner information for one round
export interface RoundWinner {
  userId: string;
  playerName: string;
  gain: number;
  winningNumber: number;
  boardType: BoardType;
}

export interface GameState {
  users: Record<string, User>;
  tableState: Bet[];
  isBettingOpen: boolean;
  rngResult: number | null;
  timeLeft: number;
  board: BoardConfig;  // Legacy global board kept for compatibility
}

export interface SpinResponse {
  status: 'success' | 'error';
  winningNumber: number | null;
  winners: RoundWinner[];
  newState: GameState;
}

// Defines the numbers available for a roulette board
export interface BoardConfig {
  type: BoardType;
  numbers: number[];
}
