import type { GameState } from './GameState'
import type { Player } from './Player'

export interface GameRoomData<G = any> {
  room: string
  game?: string | null
  maxPlayers?: number
  minPlayers?: number
  players: Map<string, Player>
  gameState: GameState<G>
  history: GameState<G>[]
}

export class GameRoom<G = any> implements GameRoomData<G> {
  room: string
  game?: string | null | undefined
  maxPlayers: number = 2
  minPlayers: number = 2
  players: Map<string, Player>
  gameState: GameState<G>
  history: GameState<G>[]

  constructor(data: GameRoomData<G>) {
    this.room = data.room
    this.game = data.game
    this.maxPlayers = data.maxPlayers ?? 2
    this.minPlayers = data.minPlayers?? 2
    this.players = data.players
    this.gameState = data.gameState
    this.history = data.history
    this.history.push(this.gameState)
    this.players = data.players
  }
}
