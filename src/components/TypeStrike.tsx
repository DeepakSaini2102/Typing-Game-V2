import React, { useState, useEffect, useRef } from "react";
import { FaPause, FaPlay, FaRedo, FaHome } from "react-icons/fa";
import { StatsManager } from "../utils/statsManager";
import "../styles/game.css";

interface TypeStrikeProps {
  onHome?: () => void;
  isInitialLoad?: boolean;
}

interface Mine {
  id: string;
  word: string;
  x: number;
  y: number;
  isDestroyed: boolean;
  delayMs: number;
  hasStarted: boolean;
  colorClass: string;
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

export const TypeStrike: React.FC<TypeStrikeProps> = ({ onHome, isInitialLoad }) => {
  const isDev = Boolean(
    (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV,
  );
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
  const [errorMineId, setErrorMineId] = useState<string | null>(null);
  const [wordsDestroyed, setWordsDestroyed] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [countdownTimer, setCountdownTimer] = useState<number | null>(isInitialLoad ? 3 : null);
  const [devLevelInput, setDevLevelInput] = useState<number>(1);
  const [arrows, setArrows] = useState<
    Array<{
      id: string;
      mineId: string;
      startX: number;
      startY: number;
      targetX: number;
      targetY: number;
      durationMs: number;
    }>
  >([]);
  const gameLoopRef = useRef<number | null>(null);
  const gameStartTimeRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number>(Date.now());
  const arenaRef = useRef<HTMLDivElement>(null);

  // Word bank for different levels
  const wordBanks = [
    // ===== 3 LETTER WORDS (Lv 1–3) =====
    {
      words: [
        "cat",
        "dog",
        "sun",
        "bat",
        "run",
        "hat",
        "pen",
        "box",
        "toy",
        "car",
        "bus",
        "map",
        "sky",
        "ice",
        "fun",
        "jet",
        "key",
        "sea",
        "egg",
      ],
      speed: 0.2,
      minesCount: 3,
    },
    {
      words: [
        "cat",
        "dog",
        "sun",
        "bat",
        "run",
        "hat",
        "pen",
        "box",
        "toy",
        "car",
        "bus",
        "map",
        "sky",
        "ice",
        "fun",
        "jet",
        "key",
        "sea",
        "egg",
      ],
      speed: 0.3,
      minesCount: 4,
    },
    {
      words: [
        "cat",
        "dog",
        "sun",
        "bat",
        "run",
        "hat",
        "pen",
        "box",
        "toy",
        "car",
        "bus",
        "map",
        "sky",
        "ice",
        "fun",
        "jet",
        "key",
        "sea",
        "egg",
      ],
      speed: 0.4,
      minesCount: 5,
    },

    // ===== 4 LETTER WORDS (Lv 4–6) =====
    {
      words: [
        "game",
        "play",
        "jump",
        "code",
        "fire",
        "move",
        "shot",
        "aims",
        "ball",
        "goal",
        "time",
        "zone",
        "stay",
        "wave",
        "race",
        "fast",
        "slow",
        "dash",
      ],
      speed: 0.18,
      minesCount: 3,
    },
    {
      words: [
        "game",
        "play",
        "jump",
        "code",
        "fire",
        "move",
        "shot",
        "aims",
        "ball",
        "goal",
        "time",
        "zone",
        "stay",
        "wave",
        "race",
        "fast",
        "slow",
        "dash",
      ],
      speed: 0.28,
      minesCount: 3,
    },
    {
      words: [
        "game",
        "play",
        "jump",
        "code",
        "fire",
        "move",
        "shot",
        "aims",
        "ball",
        "goal",
        "time",
        "zone",
        "stay",
        "wave",
        "race",
        "fast",
        "slow",
        "dash",
      ],
      speed: 0.38,
      minesCount: 4,
    },

    // ===== 5 LETTER WORDS (Lv 7–9) =====
    {
      words: [
        "arrow",
        "enemy",
        "focus",
        "dodge",
        "power",
        "level",
        "quick",
        "skill",
        "guard",
        "storm",
        "laser",
        "speed",
        "boost",
        "blast",
        "shift",
        "timer",
        "score",
      ],
      speed: 0.16,
      minesCount: 4,
    },
    {
      words: [
        "arrow",
        "enemy",
        "focus",
        "dodge",
        "power",
        "level",
        "quick",
        "skill",
        "guard",
        "storm",
        "laser",
        "speed",
        "boost",
        "blast",
        "shift",
        "timer",
        "score",
      ],
      speed: 0.26,
      minesCount: 4,
    },
    {
      words: [
        "arrow",
        "enemy",
        "focus",
        "dodge",
        "power",
        "level",
        "quick",
        "skill",
        "guard",
        "storm",
        "laser",
        "speed",
        "boost",
        "blast",
        "shift",
        "timer",
        "score",
      ],
      speed: 0.36,
      minesCount: 5,
    },

    // ===== 6 LETTER WORDS (Lv 10–12) =====
    {
      words: [
        "damage",
        "target",
        "attack",
        "charge",
        "player",
        "weapon",
        "shield",
        "dodger",
        "danger",
        "rocket",
        "strike",
        "turret",
        "wizard",
        "runner",
      ],
      speed: 0.15,
      minesCount: 5,
    },
    {
      words: [
        "damage",
        "target",
        "attack",
        "charge",
        "player",
        "weapon",
        "shield",
        "dodger",
        "danger",
        "rocket",
        "strike",
        "turret",
        "wizard",
        "runner",
      ],
      speed: 0.25,
      minesCount: 5,
    },
    {
      words: [
        "damage",
        "target",
        "attack",
        "charge",
        "player",
        "weapon",
        "shield",
        "dodger",
        "danger",
        "rocket",
        "strike",
        "turret",
        "wizard",
        "runner",
      ],
      speed: 0.35,
      minesCount: 6,
    },

    // ===== 7 LETTER WORDS (Lv 13–15) =====
    {
      words: [
        "survive",
        "ability",
        "control",
        "accuracy",
        "upgrade",
        "counter",
        "defense",
        "advance",
        "charging",
        "mission",
        "explore",
        "gravity",
      ],
      speed: 0.14,
      minesCount: 6,
    },
    {
      words: [
        "survive",
        "ability",
        "control",
        "accuracy",
        "upgrade",
        "counter",
        "defense",
        "advance",
        "charging",
        "mission",
        "explore",
        "gravity",
      ],
      speed: 0.24,
      minesCount: 6,
    },
    {
      words: [
        "survive",
        "ability",
        "control",
        "accuracy",
        "upgrade",
        "counter",
        "defense",
        "advance",
        "charging",
        "mission",
        "explore",
        "gravity",
      ],
      speed: 0.34,
      minesCount: 7,
    },

    // ===== 8 LETTER WORDS (Lv 16–18) =====
    {
      words: [
        "movement",
        "strategy",
        "collision",
        "reaction",
        "distance",
        "accuracy",
        "planning",
        "stamina",
        "training",
        "tracking",
        "terminal",
      ],
      speed: 0.13,
      minesCount: 7,
    },
    {
      words: [
        "movement",
        "strategy",
        "collision",
        "reaction",
        "distance",
        "accuracy",
        "planning",
        "stamina",
        "training",
        "tracking",
        "terminal",
      ],
      speed: 0.23,
      minesCount: 7,
    },
    {
      words: [
        "movement",
        "strategy",
        "collision",
        "reaction",
        "distance",
        "accuracy",
        "planning",
        "stamina",
        "training",
        "tracking",
        "terminal",
      ],
      speed: 0.33,
      minesCount: 8,
    },

    // ===== 9 LETTER WORDS (Lv 19–21) =====
    {
      words: [
        "precision",
        "survivor",
        "mechanics",
        "controller",
        "execution",
        "strategic",
        "objective",
        "challenge",
        "character",
        "inventory",
      ],
      speed: 0.12,
      minesCount: 8,
    },
    {
      words: [
        "precision",
        "survivor",
        "mechanics",
        "controller",
        "execution",
        "strategic",
        "objective",
        "challenge",
        "character",
        "inventory",
      ],
      speed: 0.22,
      minesCount: 8,
    },
    {
      words: [
        "precision",
        "survivor",
        "mechanics",
        "controller",
        "execution",
        "strategic",
        "objective",
        "challenge",
        "character",
        "inventory",
      ],
      speed: 0.32,
      minesCount: 9,
    },

    // ===== 10 LETTER WORDS (Lv 22–24) =====
    {
      words: [
        "performance",
        "procedural",
        "architecture",
        "difficulty",
        "appearance",
        "reflection",
        "restarting",
        "controller",
      ],
      speed: 0.11,
      minesCount: 9,
    },
    {
      words: [
        "performance",
        "procedural",
        "architecture",
        "difficulty",
        "appearance",
        "reflection",
        "restarting",
        "controller",
      ],
      speed: 0.21,
      minesCount: 9,
    },
    {
      words: [
        "performance",
        "procedural",
        "architecture",
        "difficulty",
        "appearance",
        "reflection",
        "restarting",
        "controller",
      ],
      speed: 0.31,
      minesCount: 10,
    },

    // ===== 11 LETTER WORDS (Lv 25–27) =====
    {
      words: [
        "responsible",
        "maintaining",
        "synchronise",
        "visualising",
        "preparation",
        "cooperation",
        "supervision",
      ],
      speed: 0.1,
      minesCount: 10,
    },
    {
      words: [
        "responsible",
        "maintaining",
        "synchronise",
        "visualising",
        "preparation",
        "cooperation",
        "supervision",
      ],
      speed: 0.2,
      minesCount: 10,
    },
    {
      words: [
        "responsible",
        "maintaining",
        "synchronise",
        "visualising",
        "preparation",
        "cooperation",
        "supervision",
      ],
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
        "communication",
        "acceleration",
        "optimization",
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
        "communication",
        "acceleration",
        "optimization",
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
        "communication",
        "acceleration",
        "optimization",
      ],
      speed: 0.29,
      minesCount: 12,
    },
  ];

  const currentWordBank =
    wordBanks[Math.min(gameState.level - 1, wordBanks.length - 1)];
  const finishLineY = 90;

  // Color themes for mines – chosen to keep white text readable
  const mineColorClasses = [
    "mine-red",
    "mine-blue",
    "mine-green",
    "mine-purple",
    "mine-orange",
  ];

  const getNextTargetMine = (minesList: Mine[]): Mine | undefined => {
    const alive = minesList.filter((m) => !m.isDestroyed);
    if (alive.length === 0) return undefined;
    // Always target the mine that was scheduled to start first (smallest delay)
    return alive.reduce((prev, curr) =>
      curr.delayMs < prev.delayMs ? curr : prev,
    );
  };

  const clampLevel = (lvl: number) =>
    Math.max(1, Math.min(30, Math.floor(Number.isFinite(lvl) ? lvl : 1)));

  const jumpToLevelForDev = (lvl: number) => {
    const level = clampLevel(lvl);
    setMines([]);
    setInput("");
    setTargetedMineId(null);
    setErrorMineId(null);
    setWordsDestroyed(0);
    setTotalAttempts(0);
    setArrows([]);
    setGameState((prev) => ({
      ...prev,
      level,
      score: 0,
      gameOver: false,
      levelComplete: false,
      gameWon: false,
      isPaused: false,
    }));
    sessionStartTimeRef.current = Date.now();
    setCountdownTimer(1); // quick countdown for dev testing
  };

  // Countdown timer effect
  useEffect(() => {
    if (countdownTimer === null) return;

    if (countdownTimer === 0) {
      setCountdownTimer(null);
      return;
    }

    const timer = setTimeout(() => {
      setCountdownTimer(countdownTimer - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdownTimer]);

  // Initialize game / spawn new wave
  useEffect(() => {
    if (
      !gameState.gameOver &&
      !gameState.levelComplete &&
      !gameState.gameWon &&
      mines.length === 0 &&
      countdownTimer === null
    ) {
      spawnWave();
    }
  }, [
    gameState.gameOver,
    gameState.levelComplete,
    gameState.gameWon,
    mines.length,
    countdownTimer,
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

      const randomColorClass =
        mineColorClasses[Math.floor(Math.random() * mineColorClasses.length)];

      newMines.push({
        id: `mine-${i}-${Date.now()}`,
        word: randomWord,
        x: randomX,
        y: 0,
        isDestroyed: false,
        delayMs: i * 2500, // 2500ms delay between each mine
        hasStarted: false,
        colorClass: randomColorClass,
      });
    }
    setMines(newMines);
    setTargetedMineId(null);
    setErrorMineId(null);
    setInput("");
    gameStartTimeRef.current = Date.now(); // Reset start time for each wave
  };

  // Keep targeted mine in correct order (one active word at a time)
  useEffect(() => {
    if (mines.length === 0) {
      setTargetedMineId(null);
      setErrorMineId(null);
      setInput("");
      return;
    }

    const currentTargetAlive = mines.some(
      (m) => m.id === targetedMineId && !m.isDestroyed,
    );

    if (!currentTargetAlive) {
      const next = getNextTargetMine(mines);
      if (next) {
        setTargetedMineId(next.id);
        setErrorMineId(null);
        setInput("");
      }
    }
  }, [mines, targetedMineId]);

  // Game loop - move mines down
  useEffect(() => {
    if (
      gameState.gameOver ||
      gameState.levelComplete ||
      gameState.gameWon ||
      gameState.isPaused ||
      mines.length === 0 ||
      countdownTimer !== null
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
    countdownTimer,
  ]);

  // Handle key press for typing
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Handle Enter key to trigger modal buttons
      if (key === "enter") {
        if (gameState.gameOver) {
          handleRestart();
          return;
        }
        if (gameState.levelComplete && !gameState.gameWon) {
          handleStartNextLevel();
          return;
        }
        if (gameState.gameWon) {
          handleRestart();
          return;
        }
      }

      // Handle Space key to pause/resume game
      if (key === " ") {
        if (
          !gameState.gameOver &&
          !gameState.levelComplete &&
          !gameState.gameWon
        ) {
          handlePause();
          e.preventDefault();
        }
        return;
      }

      if (
        gameState.gameOver ||
        gameState.levelComplete ||
        gameState.gameWon ||
        gameState.isPaused
      )
        return;

      // Reset on Escape
      if (key === "escape") {
        setInput("");
        setErrorMineId(null);
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

        // Ensure we always have a target (in the correct order)
        if (!targetedMineId) {
          const next = getNextTargetMine(mines);
          if (!next) return;
          setTargetedMineId(next.id);
          setErrorMineId(null);
          setInput("");
        }

        // Check if input matches targeted mine
        const targeted = mines.find((m) => m.id === targetedMineId);
        if (targeted) {
          const newInput = input + key;
          const targetWord = targeted.word.toLowerCase();

          if (targetWord.startsWith(newInput.toLowerCase())) {
            setInput(newInput);
            setErrorMineId(null);

            // Fire arrow when typing (fast, keeps up with rapid typing)
            if (targetedMineId) {
              const startX = 50; // Center bottom (percentage)
              const startY = 85; // Near bottom
              const targetX = targeted.x;
              const targetY = targeted.y;
              const durationMs = 220;

              const arrowId = `arrow-${Date.now()}-${Math.random()}`;
              setArrows((prev) => [
                ...prev,
                {
                  id: arrowId,
                  mineId: targetedMineId,
                  startX,
                  startY,
                  targetX,
                  targetY,
                  durationMs,
                },
              ]);

              // Remove arrow after animation
              setTimeout(() => {
                setArrows((prev) => prev.filter((a) => a.id !== arrowId));
              }, durationMs + 40);
            }

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

              // Track stats
              setWordsDestroyed((prev) => prev + 1);
              setTotalAttempts((prev) => prev + 1);
              
              // Remove all arrows targeting this mine
              setArrows((prev) => prev.filter((a) => a.mineId !== targetedMineId));
              
              // Auto-target next mine
              setTimeout(() => {
                const nextMine = getNextTargetMine(mines.filter((m) => m.id !== targetedMineId));
                if (nextMine) {
                  setTargetedMineId(nextMine.id);
                }
                setInput("");
                setErrorMineId(null);
              }, 200);
            }
          } else {
            // Wrong letter - deduct points
            setGameState((prev) => ({
              ...prev,
              score: Math.max(0, prev.score - 5),
            }));
            setInput("");
            setErrorMineId(targetedMineId);
            setTotalAttempts((prev) => prev + 1);
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

    // Clicking mines is disabled to enforce strict typing order
    return;
  };

  const handlePause = () => {
    setGameState((prev) => {
      const newPausedState = !prev.isPaused;
      // Start countdown when resuming
      if (!newPausedState) {
        setCountdownTimer(3);
      }
      return { ...prev, isPaused: newPausedState };
    });
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
    setErrorMineId(null);
    setCountdownTimer(3);
  };

  const handleRestart = () => {
    // Record stats before restarting
    if (wordsDestroyed > 0 || totalAttempts > 0) {
      const accuracy = totalAttempts > 0 ? Math.round((wordsDestroyed / totalAttempts) * 100) : 0;
      const timePlayedSeconds = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
      StatsManager.recordGameEnd(gameState.score, gameState.level, accuracy, wordsDestroyed, timePlayedSeconds);
    }

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
    setErrorMineId(null);
    setWordsDestroyed(0);
    setTotalAttempts(0);
    setCountdownTimer(3);
    sessionStartTimeRef.current = Date.now();
  };

  return (
    <div className="game-container">
      <header className="game-header">
        <button
          className="home-btn"
          onClick={onHome}
          aria-label="Return to home menu"
        >
          <FaHome />
        </button>
        <h1>Type Strike</h1>
        {isDev && (
          <div className="dev-controls" aria-label="Developer controls">
            <span className="dev-label">DEV</span>
            <label className="dev-level">
              <span>Level</span>
              <input
                type="number"
                min={1}
                max={30}
                value={devLevelInput}
                onChange={(e) => setDevLevelInput(clampLevel(Number(e.target.value)))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") jumpToLevelForDev(devLevelInput);
                }}
              />
            </label>
            <button
              type="button"
              className="dev-go"
              onClick={() => jumpToLevelForDev(devLevelInput)}
            >
              Go
            </button>
          </div>
        )}
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
        <div className="mines-arena" ref={arenaRef}>
          {/* Gun/Bow at bottom center */}
          <div className="gun-container">
            <div 
              className="gun"
              style={{
                "--gun-angle": targetedMineId 
                  ? (() => {
                      const targeted = mines.find((m) => m.id === targetedMineId);
                      if (!targeted) return "0deg";
                      const dx = targeted.x - 50;
                      const dy = targeted.y - 85;
                      const angle = Math.atan2(dy, dx) * (180 / Math.PI) - 90;
                      return `${angle}deg`;
                    })()
                  : "0deg",
              } as React.CSSProperties}
            ></div>
          </div>

          {/* Arrows/Bullets */}
          {arrows.map((arrow) => {
            const targetedMine = mines.find((m) => m.id === arrow.mineId);
            if (!targetedMine) return null;

            // Calculate angle for arrow rotation
            const dx = arrow.targetX - arrow.startX;
            const dy = arrow.targetY - arrow.startY;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

            return (
              <div
                key={arrow.id}
                className="arrow"
                style={{
                  left: `${arrow.startX}%`,
                  top: `${arrow.startY}%`,
                  "--target-x": `${arrow.targetX}%`,
                  "--target-y": `${arrow.targetY}%`,
                  "--angle": `${angle}deg`,
                  "--arrow-dur": `${arrow.durationMs}ms`,
                } as React.CSSProperties}
              >
                <div className="arrow-body"></div>
              </div>
            );
          })}

          {mines.map((mine) => (
            <div
              key={mine.id}
              data-mine-id={mine.id}
              className={`mine ${mine.isDestroyed ? "destroyed" : ""} ${
                targetedMineId === mine.id ? "targeted" : ""
              } ${errorMineId === mine.id ? "error" : ""} ${
                !mine.hasStarted ? "waiting" : ""
              }`}
              style={{
                left: `${mine.x}%`,
                top: `${mine.y}%`,
              }}
            >
              <div className={`mine-body ${mine.colorClass}`}>
                <span className="mine-word">{mine.word}</span>
              </div>
              {mine.isDestroyed && (
                <div className="explosion">
                  <div className="explosion-particle"></div>
                  <div className="explosion-particle"></div>
                  <div className="explosion-particle"></div>
                  <div className="explosion-particle"></div>
                  <div className="explosion-particle"></div>
                  <div className="explosion-particle"></div>
                </div>
              )}
            </div>
          ))}

          <div className="finish-line"></div>
        </div>
      </main>

      <div className="game-input-section">
        <div className="input-display">
          {/* <p className="target-word">
            {targetedMineId && mines.find((m) => m.id === targetedMineId)?.word}
          </p> */}
          <p className="typed-text">{input}</p>
        </div>
        <p className="input-hint">
          {gameState.isPaused
            ? "GAME PAUSED"
            : targetedMineId
              ? "Type the highlighted word to blast the mine!"
              : "Get ready to type the next word in order"}
        </p>

        <div className="game-controls">
          <button className="control-btn pause-btn" onClick={handlePause}>
            {gameState.isPaused ? <FaPlay /> : <FaPause />}
            <span className="button-label">
              {gameState.isPaused ? "Resume" : "Pause"}
            </span>
          </button>
          <button className="control-btn restart-btn" onClick={handleRestart}>
            <FaRedo />
            <span className="button-label">Restart</span>
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
            <p className="victory-message">You've completed all 30 levels!</p>
            <button onClick={handleRestart}>Play Again</button>
          </div>
        </div>
      )}

      {countdownTimer !== null && (
        <div className="countdown-container">
          <div className="countdown-timer">{countdownTimer}</div>
        </div>
      )}
    </div>
  );
};

export default TypeStrike;
