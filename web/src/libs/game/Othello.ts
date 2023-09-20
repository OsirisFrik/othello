import { reactive } from 'vue'
import { CellValue } from '../enum'
import { getKeyEnumByVal } from '../tools'
import Multiplayer from './Multiplayer'

export type Movement = [x: number, y: number]
export type Board = CellValue[][]

export default class Othello extends Multiplayer {
  _board: Board
  #turn: CellValue = CellValue.BLACK
  #player: CellValue = CellValue.EMPTY

  #directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],          [0, 1],
    [1, -1], [1, 0], [1, 1]
  ]

  constructor(room: string) {
    super({
      room,
      maxPlayers: 2,
      autoConnect: true
    })
    
    this._board = reactive<Board>(
      Array.from({ length: 8 },
        () => Array.from({ length: 8 },
          () => CellValue.EMPTY
        )
      ))

    this._board[3][3] = CellValue.WHITE
    this._board[3][4] = CellValue.BLACK
    this._board[4][3] = CellValue.BLACK
    this._board[4][4] = CellValue.WHITE
  }

  get board() {
    return this._board
  }

  validateMove([x, y]: Movement, turn = this.#turn): boolean {
    return this.getBeetweemChips([x, y], turn).length > 0
  }

  getBeetweemChips([x, y]: Movement, turn = this.#turn): Movement[] {
    const result: Movement[] = []

    if (this._board[x][y] !== CellValue.EMPTY) return result

    for (const [dx, dy] of this.#directions) {
      let foundOpponent = false
      let i = x + dx
      let j = y + dy

      while (i >= 0 && i < 8 && j >= 0 && j < 8) {
        const _value = this._board[i][j]

        if (_value === CellValue.EMPTY) break

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

  toggleChip([x, y]: Movement): void {
    console.log(x, y, this._board[x][y])
    this._board[x][y] = this.#turn

    console.log(x, y, this._board[x][y])
  }

  makeMove([x, y]: Movement): Board {
    const movements: Movement[] = [[x, y], ...this.getBeetweemChips([x, y])]

    if (movements.length < 2) return this._board
    
    for (const movement of movements) {
      this.toggleChip(movement)
    }

    this.toggleTurn()

    return this._board
  }

  toggleTurn(): void {
    const next = this.#turn === CellValue.BLACK? CellValue.WHITE : CellValue.BLACK

    if (this.hasValidMovements(next)) this.#turn = next
    else {
      console.log(`No valid movements for ${next}`)
    }

    console.log(getKeyEnumByVal(CellValue, this.#turn))
  }

  hasValidMovements(nextTurn: CellValue): boolean {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this._board[i][j] === CellValue.EMPTY && this.validateMove([i, j], nextTurn)) {
          return true
        }
      }
    }

    return false
  }
}
