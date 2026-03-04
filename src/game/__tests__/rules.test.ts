import { describe, it, expect } from "vitest";
import { applyShot, allShipsSunk } from "../rules.ts";
import { createEmptyBoard } from "../board.ts";
import type { PlacedShip } from "../types.ts";

function makeShips(): PlacedShip[] {
  return [
    {
      ship: { name: "Destroyer", length: 2 },
      coords: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
      ],
    },
    {
      ship: { name: "Submarine", length: 3 },
      coords: [
        { row: 2, col: 2 },
        { row: 3, col: 2 },
        { row: 4, col: 2 },
      ],
    },
  ];
}

function makeBoardWithShips(ships: PlacedShip[]) {
  const board = createEmptyBoard();
  for (const ps of ships) {
    for (const c of ps.coords) {
      board[c.row][c.col] = "ship";
    }
  }
  return board;
}

describe("applyShot", () => {
  it("returns miss for an empty cell", () => {
    const ships = makeShips();
    const board = makeBoardWithShips(ships);
    const shots = createEmptyBoard();

    const result = applyShot(board, shots, ships, { row: 5, col: 5 });

    expect(result.outcome).toBe("miss");
    expect(board[5][5]).toBe("miss");
    expect(shots[5][5]).toBe("miss");
  });

  it("returns hit for a ship cell that doesn't sink the ship", () => {
    const ships = makeShips();
    const board = makeBoardWithShips(ships);
    const shots = createEmptyBoard();

    const result = applyShot(board, shots, ships, { row: 0, col: 0 });

    expect(result.outcome).toBe("hit");
    expect(board[0][0]).toBe("hit");
    expect(shots[0][0]).toBe("hit");
  });

  it("returns sunk when the last cell of a ship is hit", () => {
    const ships = makeShips();
    const board = makeBoardWithShips(ships);
    const shots = createEmptyBoard();

    // Hit first cell of Destroyer
    applyShot(board, shots, ships, { row: 0, col: 0 });
    // Hit second cell → should sink
    const result = applyShot(board, shots, ships, { row: 0, col: 1 });

    expect(result.outcome).toBe("sunk");
    expect(result.sunkShip).toEqual({ name: "Destroyer", length: 2 });
  });
});

describe("allShipsSunk", () => {
  it("returns false when ships still have unhit cells", () => {
    const ships = makeShips();
    const board = makeBoardWithShips(ships);

    expect(allShipsSunk(ships, board)).toBe(false);
  });

  it("returns true when every ship cell has been hit", () => {
    const ships = makeShips();
    const board = makeBoardWithShips(ships);

    // Hit every ship cell
    for (const ps of ships) {
      for (const c of ps.coords) {
        board[c.row][c.col] = "hit";
      }
    }

    expect(allShipsSunk(ships, board)).toBe(true);
  });

  it("returns false when only some ships are sunk", () => {
    const ships = makeShips();
    const board = makeBoardWithShips(ships);

    // Sink only the Destroyer
    board[0][0] = "hit";
    board[0][1] = "hit";

    expect(allShipsSunk(ships, board)).toBe(false);
  });
});
