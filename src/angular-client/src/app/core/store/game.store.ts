import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { GameState, Bet, User } from '../models/game-state.model';

// Initial state matching the Backend's default values
const initialState: GameState & { userId: string | null; timer: number } = {
  users: {},
  tableState: [],
  isBettingOpen: true,
  rngResult: null,
  userId: null,
  timer: 15,
};

export const GameStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // --- COMPUTED: Derived data from the Backend state ---
  withComputed((store) => ({
    userBalance: computed(() => {
      const id = store.userId();
      const allUsers = store.users();
      return (id && allUsers[id]) ? allUsers[id].balance : 0;
    }),

    userName: computed(() => {
      const id = store.userId();
      const allUsers = store.users();
      return (id && allUsers[id]) ? allUsers[id].name : 'Guest';
    }),

    // Check if the current user has already placed a bet this round
    hasPlacedBet: computed(() => {
      const id = store.userId();
      return store.tableState().some(bet => bet.userId === id);
    })
  })),

  // --- METHODS: How we update the state ---
  withMethods((store) => ({
    // Update the entire state when receiving 'STATE_UPDATE' from NestJS
    updateGameState(newState: GameState) {
      patchState(store, {
        users: newState.users,
        tableState: newState.tableState,
        isBettingOpen: newState.isBettingOpen,
        rngResult: newState.rngResult
      });
    },

    setUserId(id: string) {
      patchState(store, { userId: id });
    },

    updateTimer(timeLeft: number) {
      patchState(store, { timer: timeLeft });
    }
  }))
);
