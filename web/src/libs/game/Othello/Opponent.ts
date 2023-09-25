import { Player, type Movement } from '@/libs/multiplayer'
import {
  Othello,
  type OthelloMultiplayer,
  type OthelloMovement,
  type OthelloPlayerState,
} from './Othello'

export default class OthelloOpponent {
  #multiplayer: OthelloMultiplayer
  #playe?: Player<OthelloPlayerState>
  #game: Othello
  
  constructor(
    game: Othello,
    multiplayer: OthelloMultiplayer,
  ) {
    this.#game = game
    this.#multiplayer = multiplayer

    this.#multiplayer.addGameEventListener('player_move', this.onPlayerMove.bind(this))
  }

  onPlayerMove(movement: Movement<OthelloMovement>) {
    if (movement.player.gameState?.chip !== this.#game.turn) return

    this.#game.makeMove(movement.movement)
  }
}
