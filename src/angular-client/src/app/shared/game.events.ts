export const GAME_EVENTS = {
  // Client => Server (Inputs)
  REGISTER: 'REGISTER_PLAYER',
  BET_ACTION: 'BET_ACTION',
  SPIN: 'SPIN_WHEEL',

  // Server =>  Client (Outputs)
  STATE_UPDATE: 'GAME_STATE',
  RESULT: 'GAME_RESULT',
  ERROR: 'GAME_ERROR',
};
