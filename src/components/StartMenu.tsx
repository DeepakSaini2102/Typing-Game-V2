import React, { useState, useEffect } from "react";
import {
  FaBolt,
  FaChartLine,
  FaBullseye,
  FaTrophy,
  FaPlay,
  FaChartBar,
} from "react-icons/fa";
import StatsPopup from "./StatsPopup";
import "../styles/menu.css";

interface StartMenuProps {
  onStart: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ onStart }) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [hoveredButton2, setHoveredButton2] = useState<string | null>(null);
  const [showStatsPopup, setShowStatsPopup] = useState(false);

  // Handle Enter key to start game
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        onStart();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onStart]);

  return (
    <div className="menu-container">
      <div className="stars"></div>

      <div className="menu-content">
        <div className="menu-header">
          <div className="menu-header-content">
            <h1 className="menu-title">Type Strike</h1>
            <p className="menu-subtitle">Master Your Typing Skills</p>
          </div>
        </div>

        <div className="menu-description">
          <p>
            A fast-paced word destruction game where accuracy is your best
            weapon.
          </p>
          <p>
            Type the correct spelling to blast incoming mines before they reach
            your base!
          </p>
        </div>

        <div className="menu-features">
          <div className="feature">
            <FaBolt className="feature-icon" />
            <span className="feature-text">Fast-Paced Action</span>
          </div>
          <div className="feature">
            <FaChartLine className="feature-icon" />
            <span className="feature-text">Progressive Difficulty</span>
          </div>
          <div className="feature">
            <FaBullseye className="feature-icon" />
            <span className="feature-text">Test Your Accuracy</span>
          </div>
          <div className="feature">
            <FaTrophy className="feature-icon" />
            <span className="feature-text">30 Challenging Levels</span>
          </div>
        </div>
        <div className="button-actions">
          <button
            className={`start-button ${hoveredButton === "start" ? "hovered" : "hovered"}`}
            onClick={onStart}
            onMouseEnter={() => setHoveredButton("start")}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span className="button-text">Start Game</span>
            <FaPlay className="button-icon" />
          </button>
          <button
            className={`start-button ${hoveredButton2 === "start" ? "hovered" : "hovered"}`}
            onClick={() => setShowStatsPopup(true)}
            onMouseEnter={() => setHoveredButton2("start")}
            onMouseLeave={() => setHoveredButton2(null)}
          >
            <span className="button-text">View statistics</span>
            <FaChartBar className="button-icon" />
          </button>
        </div>
        <div className="menu-info">
          <div className="info-item">
            <h3>How to Play</h3>
            <p>
              Type the words shown on mines to destroy them before they reach
              the finish line!
            </p>
          </div>
          <div className="info-item">
            <h3>Tips</h3>
            <p>
              Focus on accuracy, mines appear one by one, and you can pause
              anytime during gameplay.
            </p>
          </div>
        </div>
      </div>

      <div className="menu-footer">
        <p>Good luck and sharpen your typing skills!</p>
      </div>

      <StatsPopup
        isOpen={showStatsPopup}
        onClose={() => setShowStatsPopup(false)}
      />
    </div>
  );
};

export default StartMenu;
