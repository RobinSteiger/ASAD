import {GameState, User} from './game-state.model';


export class GameResponse {
  status!: 'success' | 'error';
  message?: string;
}

// Response specifically for the Spin action
export class SpinResponse extends GameResponse {
  winningNumber!: number | null;
  winners!: User[];
  newState!: GameState;
}

// Response for the Registration
export class RegistrationResponse extends GameResponse {
  user?: User;
}

export interface BetResponse {
  status: 'success' | 'error';
  message?: string;
}
