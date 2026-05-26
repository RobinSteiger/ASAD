import {BoardType, GameState, RoundWinner, User} from "../game/game.interface";

export interface GameResponse {
  status: 'success' | 'error';
  message?: string;
}

// Response for the Spin action
export interface SpinResponse {
  status: 'success' | 'error';
  boardType?: BoardType;
  winningNumber: number | null;
  winners: RoundWinner[];
  newState: GameState;
  results?: Array<{
    boardType: BoardType;
    winningNumber: number;
    winners: RoundWinner[];
  }>;
}

// Response for the Registration
export interface RegistrationResponse extends GameResponse {
  user?: User;
}

export interface BetResponse extends GameResponse {}