/** Coordinate on the 10x10 board (0-indexed). */
export interface Coord {
  row: number;
  col: number;
}

/** Possible states of a single cell. */
export type CellState = "empty" | "ship" | "miss" | "hit";

/** A 10x10 grid of cell states. */
export type Board = CellState[][];

/** Standard Battleship ship definition. */
export interface Ship {
  name: string;
  length: number;
}

/** A ship that has been placed on the board. */
export interface PlacedShip {
  ship: Ship;
  coords: Coord[];
}

/** Result returned after firing a shot. */
export interface ShotResult {
  coord: Coord;
  outcome: "miss" | "hit" | "sunk";
  sunkShip?: Ship;
}

/** Phases of a battleship game. */
export type GamePhase = "setup" | "playerTurn" | "aiTurn" | "gameOver";

/** Full game state managed by the reducer. */
export interface GameState {
  phase: GamePhase;
  playerBoard: Board;
  aiBoard: Board;
  playerShips: PlacedShip[];
  aiShips: PlacedShip[];
  /** Tracks which cells the player has fired at on the AI board. */
  playerShots: Board;
  /** Tracks which cells the AI has fired at on the player board. */
  aiShots: Board;
  winner: "player" | "ai" | null;
}

/** The five standard Battleship ships. */
export const SHIPS: Ship[] = [
  { name: "Carrier", length: 5 },
  { name: "Battleship", length: 4 },
  { name: "Cruiser", length: 3 },
  { name: "Submarine", length: 3 },
  { name: "Destroyer", length: 2 },
];

export const BOARD_SIZE = 10;
