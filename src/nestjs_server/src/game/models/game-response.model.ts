import { GameState, User } from '../game/game.interface';

export class GameResponse {
  status: 'success' | 'error';
  message?: string;
}

// Response specifically for the Spin action
export class SpinResponse extends GameResponse {
  winningNumber: number | null;
  winners: User[]; // List of people who won this round
  newState: GameState;
}

// Response for the Registration
export class RegistrationResponse extends GameResponse {
  user?: User;
}

export interface BetResponse {
  status: 'success' | 'error';
  message?: string;
}
