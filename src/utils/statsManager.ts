export interface GameStats {
  totalGamesPlayed: number;
  highestLevel: number;
  highestScore: number;
  totalScore: number;
  totalAccuracy: number;
  totalWordsDestroyed: number;
  totalTimePlayedSeconds: number;
  levelStats: Record<number, {
    timesPlayed: number;
    bestScore: number;
    averageAccuracy: number;
    wordsDestroyed: number;
  }>;
  sessionStats: {
    startTime: number;
    endTime: number;
    accuracy: number;
    score: number;
    level: number;
    wordsDestroyed: number;
  }[];
}

const STORAGE_KEY = 'type-strike-stats';

const defaultStats: GameStats = {
  totalGamesPlayed: 0,
  highestLevel: 0,
  highestScore: 0,
  totalScore: 0,
  totalAccuracy: 0,
  totalWordsDestroyed: 0,
  totalTimePlayedSeconds: 0,
  levelStats: {},
  sessionStats: [],
};

export const StatsManager = {
  getStats(): GameStats {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultStats;
    } catch {
      return defaultStats;
    }
  },

  updateStats(update: Partial<GameStats>): void {
    try {
      const current = this.getStats();
      const updated = { ...current, ...update };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      console.error('Failed to update stats');
    }
  },

  recordGameEnd(score: number, level: number, accuracy: number, wordsDestroyed: number, timePlayedSeconds: number): void {
    try {
      const stats = this.getStats();
      
      stats.totalGamesPlayed += 1;
      stats.highestLevel = Math.max(stats.highestLevel, level);
      stats.highestScore = Math.max(stats.highestScore, score);
      stats.totalScore += score;
      stats.totalAccuracy += accuracy;
      stats.totalWordsDestroyed += wordsDestroyed;
      stats.totalTimePlayedSeconds += timePlayedSeconds;

      // Update level stats
      if (!stats.levelStats[level]) {
        stats.levelStats[level] = {
          timesPlayed: 0,
          bestScore: 0,
          averageAccuracy: 0,
          wordsDestroyed: 0,
        };
      }
      
      const levelStat = stats.levelStats[level];
      levelStat.timesPlayed += 1;
      levelStat.bestScore = Math.max(levelStat.bestScore, score);
      levelStat.averageAccuracy = (levelStat.averageAccuracy * (levelStat.timesPlayed - 1) + accuracy) / levelStat.timesPlayed;
      levelStat.wordsDestroyed += wordsDestroyed;

      // Keep only last 10 sessions
      stats.sessionStats.push({
        startTime: Date.now(),
        endTime: Date.now(),
        accuracy,
        score,
        level,
        wordsDestroyed,
      });
      if (stats.sessionStats.length > 10) {
        stats.sessionStats.shift();
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      console.error('Failed to record game end');
    }
  },

  clearAllStats(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      console.error('Failed to clear stats');
    }
  },

  getAverageAccuracy(): number {
    const stats = this.getStats();
    if (stats.totalGamesPlayed === 0) return 0;
    return Math.round(stats.totalAccuracy / stats.totalGamesPlayed);
  },

  getAverageScorePerGame(): number {
    const stats = this.getStats();
    if (stats.totalGamesPlayed === 0) return 0;
    return Math.round(stats.totalScore / stats.totalGamesPlayed);
  },

  getTotalPlayTime(): string {
    const stats = this.getStats();
    const hours = Math.floor(stats.totalTimePlayedSeconds / 3600);
    const minutes = Math.floor((stats.totalTimePlayedSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  },
};
