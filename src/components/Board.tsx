import type { Board as BoardType } from "../game/types.ts";
import { BOARD_SIZE } from "../game/types.ts";
import Cell from "./Cell.tsx";

interface BoardProps {
  /** The board to display (either the raw board or a shot-tracking board). */
  board: BoardType;
  /** Whether to reveal ship cells. */
  showShips: boolean;
  /** Called when a cell is clicked; receives (row, col). */
  onCellClick?: (row: number, col: number) => void;
  /** Whether all cells should be non-interactive. */
  disabled: boolean;
  label: string;
}

const COL_HEADERS = Array.from({ length: BOARD_SIZE }, (_, i) =>
  String.fromCharCode(65 + i),
);

export default function Board({
  board,
  showShips,
  onCellClick,
  disabled,
  label,
}: BoardProps) {
  return (
    <div className="board-container">
      <h2 className="board-label">{label}</h2>
      <div className="board">
        {/* Column headers */}
        <div className="board-row">
          <div className="board-header-cell" />
          {COL_HEADERS.map((ch) => (
            <div key={ch} className="board-header-cell">
              {ch}
            </div>
          ))}
        </div>

        {board.map((row, r) => (
          <div key={r} className="board-row">
            {/* Row number */}
            <div className="board-header-cell">{r + 1}</div>
            {row.map((cell, c) => (
              <Cell
                key={`${r}-${c}`}
                state={cell}
                showShips={showShips}
                disabled={disabled}
                onClick={
                  onCellClick && !disabled
                    ? () => onCellClick(r, c)
                    : undefined
                }
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
