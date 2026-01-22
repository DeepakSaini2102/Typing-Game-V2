import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { StatsManager, GameStats } from "../utils/statsManager";
import "../styles/stats-popup.css";

interface StatsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsPopup: React.FC<StatsPopupProps> = ({ isOpen, onClose }) => {
  const [stats] = useState<GameStats>(StatsManager.getStats());
  const averageAccuracy = StatsManager.getAverageAccuracy();
  const averageScore = StatsManager.getAverageScorePerGame();
  const totalPlayTime = StatsManager.getTotalPlayTime();

  if (!isOpen) return null;

  const handleClearStats = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all statistics? This cannot be undone.",
      )
    ) {
      StatsManager.clearAllStats();
      window.location.reload();
    }
  };

  return (
    <div className="stats-overlay" onClick={onClose}>
      <div className="stats-popup" onClick={(e) => e.stopPropagation()}>
        <div className="stats-header">
          <h2>Game Statistics</h2>
          <button
            className="stats-close"
            onClick={onClose}
            aria-label="Close stats"
          >
            <FaTimes />
          </button>
        </div>
        <div className="stats-content">
          {/* Overall Stats */}
          <div className="stats-section">
            <h3 className="stats-section-title">Overall Performance</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.totalGamesPlayed}</div>
                <div className="stat-label">Games Played</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.highestLevel}</div>
                <div className="stat-label">Highest Level</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.highestScore}</div>
                <div className="stat-label">High Score</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{averageScore}</div>
                <div className="stat-label">Avg Score</div>
              </div>
            </div>
          </div>

          {/* Accuracy and Progress */}
          <div className="stats-section">
            <h3 className="stats-section-title">Accuracy & Progress</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{averageAccuracy}%</div>
                <div className="stat-label">Avg Accuracy</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.totalWordsDestroyed}</div>
                <div className="stat-label">Words Destroyed</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.totalScore}</div>
                <div className="stat-label">Total Score</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{totalPlayTime}</div>
                <div className="stat-label">Play Time</div>
              </div>
            </div>
          </div>

          {/* Level Stats */}
          {Object.keys(stats.levelStats).length > 0 && (
            <div className="stats-section">
              <h3 className="stats-section-title">Level Performance</h3>
              <div className="level-stats-container">
                {Object.entries(stats.levelStats)
                  .sort(([levelA], [levelB]) => Number(levelA) - Number(levelB))
                  .map(([level, levelStat]) => (
                    <div key={level} className="level-stat">
                      <div className="level-info">
                        <span className="level-name">Level {level}</span>
                        <span className="level-times">
                          Played {levelStat.timesPlayed}x
                        </span>
                      </div>
                      <div className="level-details">
                        <span className="detail">
                          Best: {levelStat.bestScore}
                        </span>
                        <span className="detail">
                          Acc: {Math.round(levelStat.averageAccuracy)}%
                        </span>
                        <span className="detail">
                          Words: {levelStat.wordsDestroyed}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
        {/* Clear Stats Button */}
        <div className="stats-actions">
          <button className="clear-btn" onClick={handleClearStats}>
            Clear All Statistics
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsPopup;
