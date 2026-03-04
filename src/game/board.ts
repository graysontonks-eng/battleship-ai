import type { Board, Coord, PlacedShip, Ship } from "./types.ts";
import { BOARD_SIZE, SHIPS } from "./types.ts";

/** Create a 10x10 board filled with "empty". */
export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from<string, "empty">({ length: BOARD_SIZE }, () => "empty"),
  );
}

/** Direction a ship can face. */
type Direction = "horizontal" | "vertical";

/**
 * Compute the list of coordinates a ship would occupy given an origin and
 * direction. Returns `null` if any coordinate falls outside the board.
 */
function shipCoords(
  origin: Coord,
  length: number,
  direction: Direction,
): Coord[] | null {
  const coords: Coord[] = [];
  for (let i = 0; i < length; i++) {
    const row = direction === "vertical" ? origin.row + i : origin.row;
    const col = direction === "horizontal" ? origin.col + i : origin.col;
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
      return null;
    }
    coords.push({ row, col });
  }
  return coords;
}

/**
 * Check whether `coords` overlap with any already-occupied cells on `board`.
 */
function hasOverlap(board: Board, coords: Coord[]): boolean {
  return coords.some((c) => board[c.row][c.col] !== "empty");
}

/**
 * Validate that a placement is legal: all coords in-bounds and no overlap.
 */
export function isValidPlacement(board: Board, coords: Coord[]): boolean {
  const inBounds = coords.every(
    (c) =>
      c.row >= 0 && c.row < BOARD_SIZE && c.col >= 0 && c.col < BOARD_SIZE,
  );
  if (!inBounds) return false;
  return !hasOverlap(board, coords);
}

/**
 * Place a ship on the board, mutating it in-place. Returns the coords used.
 * Throws if the placement is invalid.
 */
function placeShip(
  board: Board,
  origin: Coord,
  ship: Ship,
  direction: Direction,
): Coord[] {
  const coords = shipCoords(origin, ship.length, direction);
  if (!coords) {
    throw new Error(`Ship ${ship.name} goes out of bounds`);
  }
  if (hasOverlap(board, coords)) {
    throw new Error(`Ship ${ship.name} overlaps another ship`);
  }
  for (const c of coords) {
    board[c.row][c.col] = "ship";
  }
  return coords;
}

/**
 * Randomly place all standard ships on a fresh board. Retries internally until
 * every ship fits without overlap.
 */
export function randomPlacement(): { board: Board; ships: PlacedShip[] } {
  const board = createEmptyBoard();
  const placed: PlacedShip[] = [];

  for (const ship of SHIPS) {
    let coords: Coord[] | null = null;
    // Keep trying random positions until one works
    for (let attempt = 0; attempt < 1000; attempt++) {
      const direction: Direction =
        Math.random() < 0.5 ? "horizontal" : "vertical";
      const origin: Coord = {
        row: Math.floor(Math.random() * BOARD_SIZE),
        col: Math.floor(Math.random() * BOARD_SIZE),
      };
      const candidate = shipCoords(origin, ship.length, direction);
      if (candidate && !hasOverlap(board, candidate)) {
        coords = candidate;
        break;
      }
    }

    if (!coords) {
      // Extremely unlikely but restart if it ever happens
      return randomPlacement();
    }

    placeShip(board, coords[0], ship, coords.length > 1 && coords[1].col !== coords[0].col ? "horizontal" : "vertical");
    placed.push({ ship, coords });
  }

  return { board, ships: placed };
}
