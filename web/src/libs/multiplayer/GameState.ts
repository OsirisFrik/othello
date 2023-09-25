import { v4 as uuid } from 'uuid'

export interface GameStateData<G = any> {
  id: string
  game: string
  state: G
}

export class GameState<G = any> implements GameStateData<G> {
  id: string
  game: string
  state: G
  
  constructor({
    id = uuid(),
    game,
    state,
  }: {
    id?: string
    game: string
    state: G
  }) {
    this.game = game
    this.state = state
    this.id = id
  }

  static create<G = any>(state: GameStateData<G>): GameState<G> {
    return new GameState(state)
  }

  toJson(): GameStateData<G> {
    return {
      id: this.id,
      game: this.game,
      state: this.state
    }
  }
}
