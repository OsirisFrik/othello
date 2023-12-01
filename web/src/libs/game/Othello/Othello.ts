import { reactive } from 'vue'
import { getKeyEnumByVal } from '@/libs/tools'
import { Multiplayer, Player, GameState, Movement } from '@/libs/multiplayer'
import OthelloOpponent from './Opponent'

export enum Chips {
  EMPTY,
  WHITE,
  BLACK
}

export type OthelloMovement = [x: number, y: number]
export type Board = Chips[][]

export interface OthelloState {
  board: Board
  turn: Chips
  winner: number | null
  online: boolean
  moves: OthelloMovement[]
  players: Player[]
}

export interface OthelloPlayerState {
  chip: Chips
  totalChips: number
  winner: boolean | null
}

export type OthelloMultiplayer = Multiplayer<OthelloState, OthelloMovement[], OthelloPlayerState>

export class Othello {
  #multiplayer?: OthelloMultiplayer
  state: GameState<OthelloState>
  _board: Board
  #turn: Chips = Chips.BLACK
  #player: Player<OthelloPlayerState>
  opponent?: OthelloOpponent
  #online: boolean = false
  #room: string
  #history: Movement<OthelloMovement[], OthelloPlayerState>[] = []

  #directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1]
  ]

  constructor(room: string, gameState: GameState<OthelloState>) {
    this.state = gameState
    this._board = reactive(this.state.state.board)

    this._board[3][3] = Chips.WHITE
    this._board[3][4] = Chips.BLACK
    this._board[4][3] = Chips.BLACK
    this._board[4][4] = Chips.WHITE

    this.#player = reactive(gameState.state.players[0])
    this.#room = room

    this.#player.gameState = {
      chip: Chips.BLACK,
      totalChips: 0,
      winner: false
    }

    if (this.state.state.online) {
      this.#online = true

      this.#loadMultiplayer()
    }
  }

  #loadMultiplayer() {
    this.#multiplayer = new Multiplayer({
      room: this.#room,
      maxPlayers: 2,
      autoConnect: this.#online,
      gameState: this.state,
      player: this.#player
    })

    this.opponent = new OthelloOpponent(this, this.#multiplayer)
  }

  get board() {
    return this._board
  }

  get turn() {
    return this.#turn
  }

  static createNewGame(room: string, online: boolean, player: Player): Othello {
    return new Othello(
      room,
      new GameState<OthelloState>({
        game: 'othello',
        state: {
          board: Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => Chips.EMPTY)),
          turn: Chips.BLACK,
          winner: null,
          moves: [],
          players: [player],
          online
        }
      })
    )
  }

  validateMove([x, y]: OthelloMovement, turn = this.#turn): boolean {
    return this.getBeetweemChips([x, y], turn).length > 0
  }

  getBeetweemChips([x, y]: OthelloMovement, turn = this.#turn): OthelloMovement[] {
    const result: OthelloMovement[] = []

    if (this._board[x][y] !== Chips.EMPTY) return result

    for (const [dx, dy] of this.#directions) {
      let foundOpponent = false
      let i = x + dx
      let j = y + dy

      while (i >= 0 && i < 8 && j >= 0 && j < 8) {
        const _value = this._board[i][j]

        if (_value === Chips.EMPTY) break

        if (_value === turn) {
          if (foundOpponent) {
            while (i !== x || j !== y) {
              i -= dx
              j -= dy
              result.push([i, j])
            }
          }
          break
        }

        foundOpponent = true
        i += dx
        j += dy
      }
    }

    return result
  }

  toggleChip([x, y]: OthelloMovement): void {
    console.log(x, y, this._board[x][y])
    this._board[x][y] = this.#turn

    console.log(x, y, this._board[x][y], this.state.state.board[x][y])
  }

  makeMove([x, y]: OthelloMovement): Board {
    const movements: OthelloMovement[] = [[x, y], ...this.getBeetweemChips([x, y])]

    if (movements.length < 2) return this._board

    for (const movement of movements) {
      this.toggleChip(movement)
    }

    this.toggleTurn()

    if (this.#online) {
      const movement = this.#multiplayer?.playerMove(this.#player, movements)

      if (movement) this.#history.push(movement)
    }

    return this._board
  }

  toggleTurn(): void {
    const next = this.#turn === Chips.BLACK ? Chips.WHITE : Chips.BLACK

    if (this.hasValidMovements(next)) this.#turn = next
    else {
      console.log(`No valid movements for ${next}`)
    }

    console.log(getKeyEnumByVal(Chips, this.#turn))
  }

  hasValidMovements(nextTurn: Chips): boolean {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this._board[i][j] === Chips.EMPTY && this.validateMove([i, j], nextTurn)) {
          return true
        }
      }
    }

    return false
  }
}
