type GameState = number[][]

interface MovementMessage {
  room: string
  player: 1 | 2
  next: 1 | 2
  movement: number[]
  movements: GameState
  prevGameState: GameState
  nextGameState: GameState
  timestamp: number
}
