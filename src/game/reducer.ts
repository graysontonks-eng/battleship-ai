import type { Coord, GameState } from "./types.ts";
import { createEmptyBoard, randomPlacement } from "./board.ts";
import { allShipsSunk, applyShot } from "./rules.ts";

// ── Actions ──────────────────────────────────────────────────────────────────

export type GameAction =
  | { type: "start" }
  | { type: "restart" }
  | { type: "playerFire"; coord: Coord }
  | { type: "aiFire"; coord: Coord };

// ── Initial state ────────────────────────────────────────────────────────────

export function initialGameState(): GameState {
  return {
    phase: "setup",
    playerBoard: createEmptyBoard(),
    aiBoard: createEmptyBoard(),
    playerShips: [],
    aiShips: [],
    playerShots: createEmptyBoard(),
    aiShots: createEmptyBoard(),
    winner: null,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function deepCloneBoard(board: readonly (readonly string[])[]): string[][] {
  return board.map((row) => [...row]);
}

function cloneState(state: GameState): GameState {
  return {
    ...state,
    playerBoard: deepCloneBoard(state.playerBoard) as GameState["playerBoard"],
    aiBoard: deepCloneBoard(state.aiBoard) as GameState["aiBoard"],
    playerShots: deepCloneBoard(state.playerShots) as GameState["playerShots"],
    aiShots: deepCloneBoard(state.aiShots) as GameState["aiShots"],
    playerShips: state.playerShips.map((ps) => ({
      ...ps,
      coords: ps.coords.map((c) => ({ ...c })),
    })),
    aiShips: state.aiShips.map((ps) => ({
      ...ps,
      coords: ps.coords.map((c) => ({ ...c })),
    })),
  };
}

// ── Reducer ──────────────────────────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "start": {
      if (state.phase !== "setup") return state;

      const player = randomPlacement();
      const ai = randomPlacement();

      return {
        phase: "playerTurn",
        playerBoard: player.board,
        aiBoard: ai.board,
        playerShips: player.ships,
        aiShips: ai.ships,
        playerShots: createEmptyBoard(),
        aiShots: createEmptyBoard(),
        winner: null,
      };
    }

    case "restart": {
      return initialGameState();
    }

    case "playerFire": {
      if (state.phase !== "playerTurn") return state;

      const next = cloneState(state);
      const { coord } = action;

      // Don't allow firing at the same cell twice
      if (next.playerShots[coord.row][coord.col] !== "empty") return state;

      applyShot(next.aiBoard, next.playerShots, next.aiShips, coord);

      if (allShipsSunk(next.aiShips, next.aiBoard)) {
        next.phase = "gameOver";
        next.winner = "player";
        return next;
      }

      next.phase = "aiTurn";
      return next;
    }

    case "aiFire": {
      if (state.phase !== "aiTurn") return state;

      const next = cloneState(state);
      const { coord } = action;

      // Don't allow firing at the same cell twice
      if (next.aiShots[coord.row][coord.col] !== "empty") return state;

      applyShot(next.playerBoard, next.aiShots, next.playerShips, coord);

      if (allShipsSunk(next.playerShips, next.playerBoard)) {
        next.phase = "gameOver";
        next.winner = "ai";
        return next;
      }

      next.phase = "playerTurn";
      return next;
    }

    default:
      return state;
  }
}
