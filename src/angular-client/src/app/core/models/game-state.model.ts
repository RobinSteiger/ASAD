export interface User {
  id: string;
  name: string;
  balance: number;
  lastWin?: number;
}

export interface Bet {
  userId: string;
  number: number;
  amount: number;
}

export interface GameState {
  users: Record<string, User>;
  tableState: Bet[];
  isBettingOpen: boolean;
  rngResult: number | null;
  timeLeft: number;
}

export interface SpinResponse {
  status: 'success' | 'error';
  winningNumber: number;
  winners: User[];
  newState: GameState;
}
