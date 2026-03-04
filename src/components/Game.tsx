import { useReducer, useCallback, useEffect } from "react";
import { gameReducer, initialGameState } from "../game/reducer.ts";
import type { GameState } from "../game/types.ts";
import { BOARD_SIZE } from "../game/types.ts";
import Board from "./Board.tsx";

/** Merge the raw board with the shot-tracking board so the enemy grid shows
 *  hits/misses but hides un-hit ships. */
function enemyView(state: GameState): GameState["aiBoard"] {
  return state.aiBoard.map((row, r) =>
    row.map((_cell, c) => {
      const shot = state.playerShots[r][c];
      if (shot === "hit" || shot === "miss") return shot;
      return "empty"; // hide ships
    }),
  );
}

/** Merge player board with AI shots so we can see incoming hits/misses. */
function playerView(state: GameState): GameState["playerBoard"] {
  return state.playerBoard.map((row, r) =>
    row.map((cell, c) => {
      const shot = state.aiShots[r][c];
      if (shot === "hit") return "hit";
      if (shot === "miss") return "miss";
      return cell; // show ships
    }),
  );
}

/** Pick a random unfired cell for the AI. */
function pickAiTarget(state: GameState): { row: number; col: number } {
  const available: { row: number; col: number }[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (state.aiShots[r][c] === "empty") {
        available.push({ row: r, col: c });
      }
    }
  }
  return available[Math.floor(Math.random() * available.length)];
}

function statusMessage(state: GameState): string {
  switch (state.phase) {
    case "setup":
      return 'Press "Start Game" to begin!';
    case "playerTurn":
      return "Your turn — click an enemy cell to fire.";
    case "aiTurn":
      return "Enemy is firing...";
    case "gameOver":
      return state.winner === "player"
        ? "You win! All enemy ships sunk!"
        : "You lose! The enemy sunk all your ships.";
  }
}

export default function Game() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialGameState);

  const handlePlayerFire = useCallback(
    (row: number, col: number) => {
      if (state.phase !== "playerTurn") return;
      if (state.playerShots[row][col] !== "empty") return;
      dispatch({ type: "playerFire", coord: { row, col } });
    },
    [state.phase, state.playerShots],
  );

  // Auto-fire for AI after a short delay
  useEffect(() => {
    if (state.phase !== "aiTurn") return;

    const timer = setTimeout(() => {
      const target = pickAiTarget(state);
      dispatch({ type: "aiFire", coord: target });
    }, 500);

    return () => clearTimeout(timer);
  }, [state]);

  const isPlayerTurn = state.phase === "playerTurn";
  const isGameOver = state.phase === "gameOver";

  return (
    <div className="game">
      <h1 className="game-title">Battleship</h1>

      <p className={`status ${isGameOver ? "status--gameover" : ""}`}>
        {statusMessage(state)}
      </p>

      {state.phase === "setup" ? (
        <button
          className="btn btn--start"
          onClick={() => dispatch({ type: "start" })}
        >
          Start Game
        </button>
      ) : (
        <button
          className="btn btn--restart"
          onClick={() => dispatch({ type: "restart" })}
        >
          Restart
        </button>
      )}

      {state.phase !== "setup" && (
        <div className="boards">
          <Board
            board={playerView(state)}
            showShips={true}
            disabled={true}
            label="Your Fleet"
          />
          <Board
            board={enemyView(state)}
            showShips={false}
            onCellClick={handlePlayerFire}
            disabled={!isPlayerTurn}
            label="Enemy Waters"
          />
        </div>
      )}
    </div>
  );
}
