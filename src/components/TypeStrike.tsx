import React, { useState, useEffect, useRef } from "react";
import "../styles/game.css";

interface Mine {
  id: string;
  word: string;
  x: number;
  y: number;
  isDestroyed: boolean;
  delayMs: number;
  hasStarted: boolean;
}

interface GameState {
  level: number;
  score: number;
  lives: number;
  gameOver: boolean;
  levelComplete: boolean;
  gameWon: boolean;
  isPaused: boolean;
}

export const TypeStrike: React.FC = () => {
  const [mines, setMines] = useState<Mine[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    score: 0,
    lives: 3,
    gameOver: false,
    levelComplete: false,
    gameWon: false,
    isPaused: false,
  });
  const [input, setInput] = useState("");
  const [targetedMineId, setTargetedMineId] = useState<string | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const gameStartTimeRef = useRef<number>(0);

  // Word bank for different levels
  const wordBanks = [
    // ===== 3 LETTER WORDS (Lv 1–3) =====
    {
      words: ["cat", "dog", "sun", "bat", "run", "hat", "pen", "box", "toy"],
      speed: 0.2,
      minesCount: 2,
    },
    {
      words: ["cat", "dog", "sun", "bat", "run", "hat", "pen", "box", "toy"],
      speed: 0.4,
      minesCount: 3,
    },
    {
      words: ["cat", "dog", "sun", "bat", "run", "hat", "pen", "box", "toy"],
      speed: 0.5,
      minesCount: 4,
    },

    // ===== 4 LETTER WORDS (Lv 4–6) =====
    {
      words: ["game", "play", "jump", "code", "fire", "move", "shot", "aims"],
      speed: 0.18,
      minesCount: 3,
    },
    {
      words: ["game", "play", "jump", "code", "fire", "move", "shot", "aims"],
      speed: 0.28,
      minesCount: 3,
    },
    {
      words: ["game", "play", "jump", "code", "fire", "move", "shot", "aims"],
      speed: 0.38,
      minesCount: 4,
    },

    // ===== 5 LETTER WORDS (Lv 7–9) =====
    {
      words: ["arrow", "enemy", "focus", "dodge", "power", "level", "quick"],
      speed: 0.16,
      minesCount: 4,
    },
    {
      words: ["arrow", "enemy", "focus", "dodge", "power", "level", "quick"],
      speed: 0.26,
      minesCount: 4,
    },
    {
      words: ["arrow", "enemy", "focus", "dodge", "power", "level", "quick"],
      speed: 0.36,
      minesCount: 5,
    },

    // ===== 6 LETTER WORDS (Lv 10–12) =====
    {
      words: ["damage", "target", "attack", "charge", "player", "weapon"],
      speed: 0.15,
      minesCount: 5,
    },
    {
      words: ["damage", "target", "attack", "charge", "player", "weapon"],
      speed: 0.25,
      minesCount: 5,
    },
    {
      words: ["damage", "target", "attack", "charge", "player", "weapon"],
      speed: 0.35,
      minesCount: 6,
    },

    // ===== 7 LETTER WORDS (Lv 13–15) =====
    {
      words: ["survive", "ability", "control", "accuracy", "upgrade"],
      speed: 0.14,
      minesCount: 6,
    },
    {
      words: ["survive", "ability", "control", "accuracy", "upgrade"],
      speed: 0.24,
      minesCount: 6,
    },
    {
      words: ["survive", "ability", "control", "accuracy", "upgrade"],
      speed: 0.34,
      minesCount: 7,
    },

    // ===== 8 LETTER WORDS (Lv 16–18) =====
    {
      words: ["movement", "strategy", "collision", "reaction", "distance"],
      speed: 0.13,
      minesCount: 7,
    },
    {
      words: ["movement", "strategy", "collision", "reaction", "distance"],
      speed: 0.23,
      minesCount: 7,
    },
    {
      words: ["movement", "strategy", "collision", "reaction", "distance"],
      speed: 0.33,
      minesCount: 8,
    },

    // ===== 9 LETTER WORDS (Lv 19–21) =====
    {
      words: ["precision", "survivor", "mechanics", "controller", "execution"],
      speed: 0.12,
      minesCount: 8,
    },
    {
      words: ["precision", "survivor", "mechanics", "controller", "execution"],
      speed: 0.22,
      minesCount: 8,
    },
    {
      words: ["precision", "survivor", "mechanics", "controller", "execution"],
      speed: 0.32,
      minesCount: 9,
    },

    // ===== 10 LETTER WORDS (Lv 22–24) =====
    {
      words: ["performance", "procedural", "architecture", "difficulty"],
      speed: 0.11,
      minesCount: 9,
    },
    {
      words: ["performance", "procedural", "architecture", "difficulty"],
      speed: 0.21,
      minesCount: 9,
    },
    {
      words: ["performance", "procedural", "architecture", "difficulty"],
      speed: 0.31,
      minesCount: 10,
    },

    // ===== 11 LETTER WORDS (Lv 25–27) =====
    {
      words: ["responsible", "maintaining", "synchronise", "visualising"],
      speed: 0.1,
      minesCount: 10,
    },
    {
      words: ["responsible", "maintaining", "synchronise", "visualising"],
      speed: 0.2,
      minesCount: 10,
    },
    {
      words: ["responsible", "maintaining", "synchronise", "visualising"],
      speed: 0.3,
      minesCount: 11,
    },

    // ===== 12 LETTER WORDS (Lv 28–30) =====
    {
      words: [
        "implementation",
        "determination",
        "configuration",
        "accessibility",
      ],
      speed: 0.09,
      minesCount: 11,
    },
    {
      words: [
        "implementation",
        "determination",
        "configuration",
        "accessibility",
      ],
      speed: 0.19,
      minesCount: 11,
    },
    {
      words: [
        "implementation",
        "determination",
        "configuration",
        "accessibility",
      ],
      speed: 0.29,
      minesCount: 12,
    },
  ];

  const currentWordBank =
    wordBanks[Math.min(gameState.level - 1, wordBanks.length - 1)];
  const finishLineY = 90;

  // Initialize game / spawn new wave
  useEffect(() => {
    if (
      !gameState.gameOver &&
      !gameState.levelComplete &&
      !gameState.gameWon &&
      mines.length === 0
    ) {
      spawnWave();
    }
  }, [
    gameState.gameOver,
    gameState.levelComplete,
    gameState.gameWon,
    mines.length,
  ]);

  // Spawn wave of mines - all at once, with random positions
  const spawnWave = () => {
    const newMines: Mine[] = [];
    const usedPositions = new Set<number>();

    for (let i = 0; i < currentWordBank.minesCount; i++) {
      const randomWord =
        currentWordBank.words[
          Math.floor(Math.random() * currentWordBank.words.length)
        ];

      // Get random X position (10-90% to avoid edges)
      let randomX: number;
      do {
        randomX = Math.floor(Math.random() * 80) + 10; // 10-90 range
      } while (usedPositions.has(randomX)); // Avoid overlapping positions

      usedPositions.add(randomX);

      newMines.push({
        id: `mine-${i}-${Date.now()}`,
        word: randomWord,
        x: randomX,
        y: 0,
        isDestroyed: false,
        delayMs: i * 2500, // 2500ms delay between each mine
        hasStarted: false,
      });
    }
    setMines(newMines);
    setTargetedMineId(null);
    setInput("");
    gameStartTimeRef.current = Date.now(); // Reset start time for each wave
  };

  // Game loop - move mines down
  useEffect(() => {
    if (
      gameState.gameOver ||
      gameState.levelComplete ||
      gameState.gameWon ||
      gameState.isPaused ||
      mines.length === 0
    )
      return;

    gameLoopRef.current = setInterval(() => {
      setMines((prevMines) => {
        const currentTime = Date.now();
        const updated = prevMines.map((mine) => {
          // Check if this mine should start moving
          const elapsedTime = currentTime - gameStartTimeRef.current;
          const shouldStart = elapsedTime >= mine.delayMs;

          return {
            ...mine,
            hasStarted: shouldStart || mine.hasStarted,
            y:
              shouldStart || mine.hasStarted
                ? mine.y + currentWordBank.speed
                : mine.y,
          };
        });

        // Check if any mine reached the finish line
        const reachedFinish = updated.filter(
          (m) => m.y >= finishLineY && !m.isDestroyed,
        );
        if (reachedFinish.length > 0) {
          setGameState((prev) => ({ ...prev, gameOver: true }));
        }

        // Remove destroyed mines and mines that reached the finish line
        const remaining = updated.filter(
          (m) => m.y < finishLineY && !m.isDestroyed,
        );

        // Check if wave is complete
        if (
          remaining.length === 0 &&
          updated.some((m) => m.y >= finishLineY || m.isDestroyed)
        ) {
          setGameState((prev) => {
            const nextLevel = prev.level + 1;
            return {
              ...prev,
              levelComplete: true,
              gameWon: nextLevel > 30,
            };
          });
        }

        return remaining;
      });
    }, 30);

    return () => clearInterval(gameLoopRef.current!);
  }, [
    gameState.gameOver,
    gameState.levelComplete,
    gameState.gameWon,
    gameState.isPaused,
    mines.length,
    currentWordBank.speed,
  ]);

  // Handle key press for typing
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        gameState.gameOver ||
        gameState.levelComplete ||
        gameState.gameWon ||
        gameState.isPaused
      )
        return;

      const key = e.key.toLowerCase();

      // Reset on Escape
      if (key === "escape") {
        setInput("");
        setTargetedMineId(null);
        return;
      }

      // Backspace
      if (key === "backspace") {
        setInput((prev) => prev.slice(0, -1));
        return;
      }

      // Valid letter/character
      if (/^[a-z]$/.test(key)) {
        e.preventDefault();

        // If no mine targeted, target the first matching mine
        if (!targetedMineId) {
          const matchingMine = mines.find(
            (m) =>
              !m.isDestroyed &&
              m.word.toLowerCase().startsWith((input + key).toLowerCase()),
          );
          if (matchingMine) {
            setTargetedMineId(matchingMine.id);
            setInput((prev) => prev + key);
          }
          return;
        }

        // Check if input matches targeted mine
        const targeted = mines.find((m) => m.id === targetedMineId);
        if (targeted) {
          const newInput = input + key;
          const targetWord = targeted.word.toLowerCase();

          if (targetWord.startsWith(newInput.toLowerCase())) {
            setInput(newInput);

            // Check if word is complete
            if (newInput.toLowerCase() === targetWord) {
              // Mine destroyed!
              setMines((prev) => {
                const updated = prev.map((m) =>
                  m.id === targetedMineId ? { ...m, isDestroyed: true } : m,
                );
                return updated;
              });

              setGameState((prev) => ({
                ...prev,
                score: prev.score + 50,
              }));

              // Auto-target next mine
              setTimeout(() => {
                const nextMine = mines.find(
                  (m) => m.id !== targetedMineId && !m.isDestroyed,
                );
                if (nextMine) {
                  setTargetedMineId(nextMine.id);
                }
                setInput("");
              }, 200);
            }
          } else {
            // Wrong letter - deduct points
            setGameState((prev) => ({
              ...prev,
              score: Math.max(0, prev.score - 5),
            }));
            setInput("");
            setTargetedMineId(null);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    input,
    targetedMineId,
    mines,
    gameState.gameOver,
    gameState.levelComplete,
    gameState.gameWon,
    gameState.isPaused,
  ]);

  const handleMineClick = (mineId: string) => {
    if (
      gameState.gameOver ||
      gameState.levelComplete ||
      gameState.gameWon ||
      gameState.isPaused
    )
      return;

    const mine = mines.find((m) => m.id === mineId);
    if (!mine || mine.isDestroyed) return;

    if (!targetedMineId) {
      setTargetedMineId(mineId);
      setInput("");
    }
  };

  const handlePause = () => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleStartNextLevel = () => {
    setMines([]);
    setGameState((prev) => {
      const nextLevel = prev.level + 1;
      return {
        ...prev,
        level: nextLevel > 30 ? 30 : nextLevel,
        levelComplete: false,
        gameWon: nextLevel > 30,
      };
    });
    setInput("");
    setTargetedMineId(null);
  };

  const handleRestart = () => {
    setMines([]);
    setGameState({
      level: 1,
      score: 0,
      lives: 3,
      gameOver: false,
      levelComplete: false,
      gameWon: false,
      isPaused: false,
    });
    setInput("");
    setTargetedMineId(null);
  };

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>Type Strike</h1>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Level:</span>
            <span className="stat-value">{gameState.level}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Score:</span>
            <span className="stat-value">{gameState.score}</span>
          </div>
        </div>
      </header>

      <main className="game-field">
        <div className="mines-arena">
          {mines.map((mine) => (
            <div
              key={mine.id}
              className={`mine ${mine.isDestroyed ? "destroyed" : ""} ${
                targetedMineId === mine.id ? "targeted" : ""
              } ${!mine.hasStarted ? "waiting" : ""}`}
              style={{
                left: `${mine.x}%`,
                top: `${mine.y}%`,
              }}
              onClick={() => handleMineClick(mine.id)}
            >
              <div className="mine-body">
                <span className="mine-word">{mine.word}</span>
              </div>
            </div>
          ))}

          <div className="finish-line"></div>
        </div>
      </main>

      <div className="game-input-section">
        <div className="input-display">
          <p className="target-word">
            {targetedMineId && mines.find((m) => m.id === targetedMineId)?.word}
          </p>
          <p className="typed-text">{input}</p>
        </div>
        <p className="input-hint">
          {gameState.isPaused
            ? "⏸ GAME PAUSED"
            : targetedMineId
              ? "Type the word to blast the mine!"
              : "Click a mine or start typing to target it"}
        </p>

        <div className="game-controls">
          <button
            className="control-btn pause-btn"
            onClick={handlePause}
            title={gameState.isPaused ? "Resume" : "Pause"}
          >
            {gameState.isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>
          <button
            className="control-btn restart-btn"
            onClick={handleRestart}
            title="Restart Game"
          >
            🔄 Restart
          </button>
        </div>
      </div>

      {gameState.gameOver && (
        <div className="modal game-over">
          <div className="modal-content">
            <div className="loser-animation">
              <h2>Game Over!</h2>
              <p className="game-over-message">
                A mine reached the finish line!
              </p>
            </div>
            <p className="final-score">Score: {gameState.score}</p>
            <p className="final-level">Level: {gameState.level}</p>
            <button onClick={handleRestart}>Try Again</button>
          </div>
        </div>
      )}

      {gameState.levelComplete && !gameState.gameWon && (
        <div className="modal level-complete">
          <div className="modal-content">
            <div className="level-animation">
              <h2>Level {gameState.level} Complete!</h2>
              <div className="celebration"></div>
            </div>
            <p className="level-score">Score: {gameState.score}</p>
            <button onClick={handleStartNextLevel}>
              Start Level {gameState.level + 1}
            </button>
          </div>
        </div>
      )}

      {gameState.gameWon && (
        <div className="modal game-won">
          <div className="modal-content">
            <h2>You Won!</h2>
            <p className="final-score">Final Score: {gameState.score}</p>
            <p className="victory-message">
              You've completed all 30 levels! 🎉
            </p>
            <button onClick={handleRestart}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypeStrike;
