export interface Bet {
  userId: string;
  number: number;
  amount: number;
}

export interface GameState {
  tableState:  Bet[];
  rngResult:   number | null;
  users:       Record<string, number>;
  connections: unknown[];
}

export type WsMessageIn =
  | { type: 'GAME_STATE';    data: GameState }
  | { type: 'BET_CONFIRMED'; data: Bet       };

export type WsMessageOut =
  | { type: 'POST_BET';      data: Bet }
  | { type: 'GET_GAME_STATE'           };
