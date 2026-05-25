import {GameState, RoundWinner, User} from "../game/game.interface";

export interface GameResponse {
  status: 'success' | 'error';
  message?: string;
}

// Response for the Spin action
export interface SpinResponse extends GameResponse {
  winningNumber?: number | null;
  winners?: RoundWinner[];
  newState?: GameState;
}

// Response for the Registration
export interface RegistrationResponse extends GameResponse {
  user?: User;
}

export interface BetResponse extends GameResponse {}