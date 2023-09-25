import { v4 as uuid } from 'uuid'
import type { Player } from './Player'

export interface MovementData<M = any, P = any> {
  id?: string
  player: Player<P>
  movement: M
  timestamp?: number
  room: string
}

export class Movement<M = any, P = any> implements MovementData<M, P> {
  #timestamp: number = Date.now()
  player: Player<P>
  movement: M
  id: string
  room: string

  constructor({
    room,
    player,
    movement,
    id = uuid(),
    timestamp = Date.now(),
  }: MovementData<M, P>) {
    this.player = player
    this.movement = movement
    this.id = id
    this.#timestamp = timestamp
    this.room = room
  }

  get timestamp(): number {
    return this.#timestamp
  }

  toJson(): MovementData<M> {
    return {
      id: this.id,
      player: this.player,
      movement: this.movement,
      timestamp: this.timestamp,
      room: this.room
    }
  }
}
