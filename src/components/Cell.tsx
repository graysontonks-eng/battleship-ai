import type { CellState } from "../game/types.ts";

interface CellProps {
  state: CellState;
  /** Whether to reveal ship cells (true for player board, false for enemy). */
  showShips: boolean;
  onClick?: () => void;
  disabled: boolean;
}

function cellLabel(state: CellState, showShips: boolean): string {
  switch (state) {
    case "hit":
      return "\u2716"; // ✖
    case "miss":
      return "\u2022"; // •
    case "ship":
      return showShips ? "\u25A0" : ""; // ■ or blank
    default:
      return "";
  }
}

function cellClass(state: CellState, showShips: boolean): string {
  const base = "cell";
  if (state === "hit") return `${base} cell--hit`;
  if (state === "miss") return `${base} cell--miss`;
  if (state === "ship" && showShips) return `${base} cell--ship`;
  return base;
}

export default function Cell({ state, showShips, onClick, disabled }: CellProps) {
  return (
    <button
      className={cellClass(state, showShips)}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Cell ${state}`}
    >
      {cellLabel(state, showShips)}
    </button>
  );
}
