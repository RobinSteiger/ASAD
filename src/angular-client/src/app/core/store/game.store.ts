
import { computed } from '@angular/core';
import { GameState } from '../models/game-state.model';

type GameStoreState = {
  gameState: GameState;
  userId: string;
  timer: number;
  isLoading: boolean;
};

const initialState: GameStoreState = {
  gameState: {
    tableState: [],
    rngResult: null,
    users: {},
    connections: []
  },
  userId: '',
  timer: 10,
  isLoading: false
};

export const GameStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    userBalance: computed(() => {
      const state = store.gameState();
      return state.users[store.userId()] ?? 100;
    }),
    isBettingOpen: computed(() => store.gameState().rngResult === null),
    myCurrentBet: computed(() =>
      store.gameState().tableState.find(b => b.userId === store.userId()) ?? null
    )
  })),

  withMethods((store) => ({
    setUserId(id: string): void {
      patchState(store, { userId: id });
    },
    updateGameState(newState: GameState): void {
      patchState(store, { gameState: newState });
    },
    updateTimer(value: number): void {
      patchState(store, { timer: value });
    },
    setLoading(loading: boolean): void {
      patchState(store, { isLoading: loading });
    }
  })) // <--- Pas de virgule ici car c'est le dernier bloc
); // <--- Parenthèse de fermeture du signalStore
