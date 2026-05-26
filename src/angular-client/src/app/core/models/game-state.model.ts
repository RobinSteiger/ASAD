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

export interface BoardState {
  rngResult: number | null;
  tableState: Bet[];
  isBettingOpen: boolean;
  board: BoardConfig;
}

export interface GameState {
  users: Record<string, User>;
  timeLeft: number;
  boards: Record<BoardType, BoardState>;
}

export interface SpinResponse {
  status: 'success' | 'error';
  results: BoardResult[];
  newState: GameState;
  winningNumber?: number | null;
  winners?: RoundWinner[];
  boardType?: BoardType;
}

export interface BoardResult {
  boardType: BoardType;
  winningNumber: number;
  winners: RoundWinner[];
}

// Defines the numbers available for a roulette board
export interface BoardConfig {
  type: BoardType;
  numbers: number[];
}
