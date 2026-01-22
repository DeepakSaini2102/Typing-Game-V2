import React, { useState } from 'react'
import '../styles/menu.css'

interface StartMenuProps {
  onStart: () => void
}

export const StartMenu: React.FC<StartMenuProps> = ({ onStart }) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  return (
    <div className="menu-container">
      <div className="stars"></div>
      
      <div className="menu-content">
        <div className="menu-header">
          <h1 className="menu-title">Type Strike</h1>
          <p className="menu-subtitle">Master Your Typing Skills</p>
        </div>

        <div className="menu-description">
          <p>A fast-paced word destruction game where accuracy is your best weapon.</p>
          <p>Type the correct spelling to blast incoming mines before they reach your base!</p>
        </div>

        <div className="menu-features">
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <span className="feature-text">Fast-Paced Action</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📈</span>
            <span className="feature-text">Progressive Difficulty</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎯</span>
            <span className="feature-text">Test Your Accuracy</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🏆</span>
            <span className="feature-text">4 Challenging Levels</span>
          </div>
        </div>

        <button
          className={`start-button ${hoveredButton === 'start' ? 'hovered' : ''}`}
          onClick={onStart}
          onMouseEnter={() => setHoveredButton('start')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          <span className="button-text">Start Game</span>
          <span className="button-icon">▶</span>
        </button>

        <div className="menu-info">
          <div className="info-item">
            <h3>How to Play</h3>
            <p>Type the words shown on mines to destroy them before they reach the finish line!</p>
          </div>
          <div className="info-item">
            <h3>Tips</h3>
            <p>Focus on accuracy, mines appear one by one, and you can pause anytime during gameplay.</p>
          </div>
        </div>
      </div>

      <div className="menu-footer">
        <p>Good luck and sharpen your typing skills!</p>
      </div>
    </div>
  )
}

export default StartMenu
