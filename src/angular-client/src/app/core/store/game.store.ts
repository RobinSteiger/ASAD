import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import {BoardState, GameState, RoundWinner, SpinResponse} from '../models/game-state.model';


const europeanBoard: BoardState = {
  rngResult: null,
  tableState: [],
  isBettingOpen: true,
  board: { type: 'european', numbers: Array.from({ length: 37 }, (_, i) => i) },
};

const miniBoard: BoardState = {
  rngResult: null,
  tableState: [],
  isBettingOpen: true,
  board: { type: 'mini', numbers: Array.from({ length: 13 }, (_, i) => i) },
};

/** * Initial state of the game.
 * We add 'userId' to track the local player.
 * * We add 'lastWinners' and 'showResultPopup' for the final screen.
 */
const initialState: GameState & {
  userId: string | null;
  lastWinners: RoundWinner[];
  showResultPopup: boolean;
  lastRngResult: number | null;
} = {
  users: {},
  timeLeft: 30,
  boards: {
    european: europeanBoard,
    mini: miniBoard
  },
  userId: null,
  lastWinners: [], // Stores winners of the round
  showResultPopup: false, // Controls the visibility of the popup
  lastRngResult: null,
};

export const GameStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // --- COMPUTED: Automatic calculations from the data ---
  withComputed((store) => ({
    // Get the current player's balance from the shared state
    userBalance: computed(() => {
      const id = store.userId();
      const allUsers = store.users();
      return id && allUsers[id] ? allUsers[id].balance : 0;
    }),

    // Get the current player's name
    userName: computed(() => {
      const id = store.userId();
      const allUsers = store.users();
      return id && allUsers[id] ? allUsers[id].name : 'Guest';
    }),

    // Check if the player already has a bet on the board
    // We can used  it to block the "Leave Table" action
    hasPlacedBet: computed(() => {
      const id = store.userId();
      const boards = store.boards();
      return Object.values(boards).some(b =>
        b.tableState.some(bet => bet.userId === id)
      );
    }),

    // Check if the user balance is 0 or less
    isBankrupt: computed(() => {
      const id = store.userId();
      const users = store.users();

      if (!id || !users[id]) return false;

      return users[id].balance <= 0;
    }),

    isBettingOpen: computed(() => {
      const boards = store.boards();
      return Object.values(boards).some(b => b.isBettingOpen);
    }),

    tableState: computed(() => {
      const boards = store.boards();
      return [
        ...boards.european.tableState,
        ...boards.mini.tableState,
      ];
    }),

    rngResult: computed(() => store.lastRngResult()),
  })),

  // --- METHODS: How we update the central data ---
  withMethods((store) => {
    return {
      /**
       * Update the whole state from the Server.
       * The server sends the truth.
       */
      updateGameState(newState: GameState) {
        patchState(store, {
          users: newState.users,
          timeLeft: newState.timeLeft,
          boards: newState.boards,
        });
      },

      /**
       * Handle the Spin Result.
       * Show the popup with winners for 5 seconds.
       */
      setResult(data: SpinResponse) {
        patchState(store, {
          lastWinners: data.winners ?? [],
          showResultPopup: true,
          lastRngResult: data.winningNumber,
          ...(data.newState ? {
            users: data.newState.users,
            timeLeft: data.newState.timeLeft,
            boards: data.newState.boards,
          } : {}),
        });

        // Wait 5 seconds, then hide the popup and reset the result
        setTimeout(() => {
          patchState(store, {
            showResultPopup: false,
            lastRngResult: null,
          });
        }, 5000);
      },

      // Store the ID received after registration
      setUserId(id: string) {
        patchState(store, { userId: id });
      },

      /**
       * Reset local data when user disconnects
       */
      clearStore() {
        patchState(store, initialState);
      },
    };
  }),
);
