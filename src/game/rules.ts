import type { Board, Coord, PlacedShip, ShotResult } from "./types.ts";

/**
 * Apply a shot to a target board and return the result.
 *
 * Mutates `targetBoard` (sets the cell to "hit" or "miss") and updates the
 * tracking board (`shotBoard`) that the firing player uses to remember where
 * they've already fired.
 */
export function applyShot(
  targetBoard: Board,
  shotBoard: Board,
  ships: PlacedShip[],
  coord: Coord,
): ShotResult {
  const { row, col } = coord;
  const cell = targetBoard[row][col];

  if (cell === "ship") {
    targetBoard[row][col] = "hit";
    shotBoard[row][col] = "hit";

    // Check if this hit sank a ship
    const sunkShip = ships.find((ps) =>
      ps.coords.every((c) => targetBoard[c.row][c.col] === "hit"),
    );

    if (sunkShip) {
      return { coord, outcome: "sunk", sunkShip: sunkShip.ship };
    }
    return { coord, outcome: "hit" };
  }

  // Miss
  targetBoard[row][col] = "miss";
  shotBoard[row][col] = "miss";
  return { coord, outcome: "miss" };
}

/**
 * Determine whether all ships have been sunk on a given board.
 */
export function allShipsSunk(ships: PlacedShip[], board: Board): boolean {
  return ships.every((ps) =>
    ps.coords.every((c) => board[c.row][c.col] === "hit"),
  );
}
