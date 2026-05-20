import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed, effect } from '@angular/core';
import {GameState, SpinResponse, User} from '../models/game-state.model';

/** * Initial state of the game.
 * We add 'userId' to track the local player.
 * * We add 'lastWinners' and 'showResultPopup' for the final screen.
 */
const initialState: GameState & {
  userId: string | null;
  lastWinners: User[];
  showResultPopup: boolean
} = {
  users: {},
  tableState: [],
  isBettingOpen: true,
  rngResult: null,
  timeLeft: 15,
  userId: null,
  lastWinners: [],      //  Stores winners of the round
  showResultPopup: false // Controls the visibility of the popup
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
    // We can used  it to block the "Leave Table" action
    hasPlacedBet: computed(() => {
      const id = store.userId();
      return store.tableState().some(bet => bet.userId === id);
    }),

    // Check if the user solde is 0 
    isBankrupt: computed(() => {
      const id = store.userId();
      const users = store.users();

      if (!id || !users[id]) return false;

      return users[id].balance < 0;
    }),
  })),

  // --- METHODS: How we update the central data ---
  withMethods((store) => {

    /** * EFFECT: Watch for changes in the tableState.
     * This allows us to see when other players place bets.
     */
  /*  effect(() => {
      const bets = store.tableState();
      // console.log(' [Effect] The table has changed! Current bets:', bets);
    });
*/
    return {
      /**
       * Update the whole state from the Server.
       * The server sends the truth.
       */
      updateGameState(newState: GameState) {
        patchState(store, {
          users: newState.users,
          tableState: newState.tableState,
          isBettingOpen: newState.isBettingOpen,
          rngResult: newState.rngResult,
          timeLeft: newState.timeLeft
        });
      },
      /**
       * Handle the Spin Result.
       * Show the popup with winners for 5 seconds.
       */
      setResult(data: SpinResponse) {
        patchState(store, {
          lastWinners: data.winners,
          showResultPopup: true,
          rngResult: data.winningNumber
        });

        // Wait 5 seconds, then hide the popup and reset the result
        setTimeout(() => {
          patchState(store, {
            showResultPopup: false,
            rngResult: null
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
      }
    };
  })
);
