import { useState, useEffect } from 'react'
import StartMenu from './components/StartMenu'
import TypeStrike from './components/TypeStrike'

function App() {
  const [gameStarted, setGameStarted] = useState(false)

  const handleStartGame = () => {
    setGameStarted(true)
  }

  return (
    <>
      {gameStarted ? (
        <TypeStrike onHome={() => setGameStarted(false)} isInitialLoad={true} />
      ) : (
        <StartMenu onStart={handleStartGame} />
      )}
    </>
  )
}

export default App
