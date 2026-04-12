import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed, effect } from '@angular/core';
import { GameState } from '../models/game-state.model';

/** * Initial state of the game.
 * We add 'userId' to track the local player.
 */
const initialState: GameState & { userId: string | null } = {
  users: {},
  tableState: [],
  isBettingOpen: true,
  rngResult: null,
  timeLeft: 15, // Match the Backend timer
  userId: null,
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
      return (id && allUsers[id]) ? allUsers[id].balance : 0;
    }),

    // Get the current player's name
    userName: computed(() => {
      const id = store.userId();
      const allUsers = store.users();
      return (id && allUsers[id]) ? allUsers[id].name : 'Guest';
    }),

    // Check if the player already has a bet on the board
    hasPlacedBet: computed(() => {
      const id = store.userId();
      return store.tableState().some(bet => bet.userId === id);
    })
  })),

  // --- METHODS: How we update the central data ---
  withMethods((store) => {

    /** * EFFECT: Watch for changes in the tableState.
     * This allows us to see when other players place bets.
     */
    effect(() => {
      const bets = store.tableState();
      console.log('📢 [Effect] The table has changed! Current bets:', bets);
      // You can trigger a sound or a notification here.
    });

    return {
      /**
       * Update the whole state from the Server.
       * This is the "Data-Centered" way: the server sends the truth.
       */
      updateGameState(newState: GameState) {
        patchState(store, {
          users: newState.users,
          tableState: newState.tableState,
          isBettingOpen: newState.isBettingOpen,
          rngResult: newState.rngResult,
          timeLeft: newState.timeLeft // Time is now synced from backend
        });
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
      }
    };
  })
);
