import { GameState, RoundWinner, User } from './game-state.model';

export interface GameResponse {
  status: 'success' | 'error';
  message?: string;
}

// Response specifically for the Spin action
export interface SpinResponse extends GameResponse {
  winningNumber: number | null;
  winners: RoundWinner[];
  newState: GameState;
}

// Response for the Registration
export interface RegistrationResponse extends GameResponse {
  user?: User;
}

export interface BetResponse extends GameResponse {}
