import { describe, it, expect } from "vitest";
import { createEmptyBoard, randomPlacement, isValidPlacement } from "../board.ts";
import { BOARD_SIZE, SHIPS } from "../types.ts";

describe("createEmptyBoard", () => {
  it("returns a 10x10 board of empty cells", () => {
    const board = createEmptyBoard();
    expect(board).toHaveLength(BOARD_SIZE);
    for (const row of board) {
      expect(row).toHaveLength(BOARD_SIZE);
      for (const cell of row) {
        expect(cell).toBe("empty");
      }
    }
  });
});

describe("randomPlacement", () => {
  // Run the randomness-dependent tests many times for confidence
  const RUNS = 100;

  it("places exactly the standard 5 ships", () => {
    for (let i = 0; i < RUNS; i++) {
      const { ships } = randomPlacement();
      expect(ships).toHaveLength(SHIPS.length);
      const names = ships.map((s) => s.ship.name).sort();
      const expected = SHIPS.map((s) => s.name).sort();
      expect(names).toEqual(expected);
    }
  });

  it("never places ships out of bounds", () => {
    for (let i = 0; i < RUNS; i++) {
      const { ships } = randomPlacement();
      for (const ps of ships) {
        for (const c of ps.coords) {
          expect(c.row).toBeGreaterThanOrEqual(0);
          expect(c.row).toBeLessThan(BOARD_SIZE);
          expect(c.col).toBeGreaterThanOrEqual(0);
          expect(c.col).toBeLessThan(BOARD_SIZE);
        }
      }
    }
  });

  it("never has overlapping ship coordinates", () => {
    for (let i = 0; i < RUNS; i++) {
      const { ships } = randomPlacement();
      const allCoords = ships.flatMap((ps) => ps.coords);
      const keys = new Set(allCoords.map((c) => `${c.row},${c.col}`));
      expect(keys.size).toBe(allCoords.length);
    }
  });

  it("each ship has the correct number of coordinates", () => {
    for (let i = 0; i < RUNS; i++) {
      const { ships } = randomPlacement();
      for (const ps of ships) {
        expect(ps.coords).toHaveLength(ps.ship.length);
      }
    }
  });

  it("marks exactly the right number of cells as 'ship' on the board", () => {
    const totalShipCells = SHIPS.reduce((sum, s) => sum + s.length, 0);
    for (let i = 0; i < RUNS; i++) {
      const { board } = randomPlacement();
      let count = 0;
      for (const row of board) {
        for (const cell of row) {
          if (cell === "ship") count++;
        }
      }
      expect(count).toBe(totalShipCells);
    }
  });
});

describe("isValidPlacement", () => {
  it("rejects coords that go out of bounds", () => {
    const board = createEmptyBoard();
    const outOfBounds = [
      { row: -1, col: 0 },
      { row: 0, col: 0 },
    ];
    expect(isValidPlacement(board, outOfBounds)).toBe(false);
  });

  it("rejects coords that overlap existing ships", () => {
    const board = createEmptyBoard();
    board[0][0] = "ship";
    const overlapping = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
    ];
    expect(isValidPlacement(board, overlapping)).toBe(false);
  });

  it("accepts valid in-bounds, non-overlapping coords", () => {
    const board = createEmptyBoard();
    const valid = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ];
    expect(isValidPlacement(board, valid)).toBe(true);
  });
});
