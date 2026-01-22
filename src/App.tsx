import { useState } from 'react'
import StartMenu from './components/StartMenu'
import TypeStrike from './components/TypeStrike'

function App() {
  const [gameStarted, setGameStarted] = useState(false)

  return gameStarted ? (
    <TypeStrike />
  ) : (
    <StartMenu onStart={() => setGameStarted(true)} />
  )
}

export default App
