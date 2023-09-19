<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import randomStr from '@/libs/generator'
import GameChannel from '@/libs/rtc'
import SocketClient from '@/libs/socket'

enum CellValue {
  EMPTY,
  WHITE,
  BLACK
}

const socket = new SocketClient()
let _game: GameState = Array(8).fill(0).map(() => Array(8).fill(CellValue.EMPTY))
const currentPlayer = ref<CellValue>(CellValue.BLACK)
const router = useRouter()
const route = useRoute()
const room = route.query.room ?? randomStr(8)
const channel = new GameChannel(room as string)

if (!route.query.room) {
  router.replace({ query: { room: room } })
}

_game[3][3] = CellValue.WHITE
_game[3][4] = CellValue.BLACK
_game[4][3] = CellValue.BLACK
_game[4][4] = CellValue.WHITE

onMounted(() => {
  socket.connect()
  startGame()

  if (room) {
    socket.send('join', { room })
  }

  channel.onEvent('message', onChannelEvent)
})

function onChannelEvent(event: Event | MessageEvent<any>) {
  console.log(event)
}

function startGame() {
  const board = document.getElementById('board') as HTMLTableElement
  board.innerHTML = ''
  for (let i = 0; i < 8; i++) {
    const row = document.createElement('tr')

    board.appendChild(row)

    for (let j = 0; j < 8; j++) {
      const cell = document.createElement('td')
      const value = _game[i][j]

      cell.id = `${i}-${j}`
      cell.innerText = `${i}, ${j}, \n${value} \n${validateMove(i, j, value)}`
      cell.addEventListener('click', () => makeMove(i, j, _game[i][j]))

      row.appendChild(cell)

      if (value === CellValue.EMPTY) {
        cell.className = `cell-empty ${validateMove(i, j, _game[i][j]) ? 'can-place-piece' : ''}`
      } else if (value === CellValue.BLACK) {
        cell.classList.add('cell-black')
      } else if (value === CellValue.WHITE) {
        cell.classList.add('cell-white')
      }
    }
  }
}

function invertPlayer() {
  return currentPlayer.value === CellValue.BLACK? CellValue.WHITE : CellValue.BLACK
}

function validateMove(x: number, y: number, cellValue: CellValue): boolean {
  const value = currentPlayer.value

  if (cellValue !== CellValue.EMPTY) {
    // La celda no está vacía, no se puede colocar una ficha aquí.
    return false
  }

  // Direcciones relativas para verificar las 8 direcciones alrededor de la ficha jugada.
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1], [1, 0], [1, 1]
  ]

  // Verificar cada dirección.
  for (const [dx, dy] of directions) {
    let i = x + dx
    let j = y + dy
    let foundOpponent = false

    while (i >= 0 && i < 8 && j >= 0 && j < 8) {
      const cellValue = _game[i][j]

      if (cellValue === CellValue.EMPTY) {
        break
      }

      if (cellValue === value) {
        if (foundOpponent) {
          // Si se encuentra al menos una ficha del oponente en esta dirección,
          // el movimiento es válido.
          return true
        }
        break
      }

      // Encontrar una ficha del oponente.
      foundOpponent = true
      i += dx
      j += dy
    }
  }

  // Si no se encontró al menos una dirección válida, el movimiento no es válido.
  return false
}

function makeMove(x: number, y: number, cellValue: CellValue) {
  const value = currentPlayer.value
  const movements: GameState = []
  const tmpGame: GameState = [..._game]

  if (!validateMove(x, y, cellValue)) {
    // La jugada no es válida, salir.
    return
  }

  // Direcciones relativas para verificar las 8 direcciones alrededor de la ficha jugada.
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1], [1, 0], [1, 1]
  ]

  let validMove = false

  // Verificar cada dirección.
  for (const [dx, dy] of directions) {
    let i = x + dx
    let j = y + dy
    let foundOpponent = false

    while (i >= 0 && i < 8 && j >= 0 && j < 8) {
      const cellValue = _game[i][j]

      if (cellValue === CellValue.EMPTY) {
        break
      }

      if (cellValue === value) {
        if (foundOpponent) {
          // Cambiar las fichas del oponente capturadas.
          while (i !== x || j !== y) {
            i -= dx
            j -= dy
            tmpGame[i][j] = value
            movements.push([i, j])
          }
          validMove = true
        }
        break
      }

      // Encontrar una ficha del oponente.
      foundOpponent = true
      i += dx
      j += dy
    }
  }

  // Si se hizo una jugada válida, cambiar de jugador.
  if (validMove) {
    currentPlayer.value = invertPlayer()
    socket.sendMovement({
      movements,
      room: `${room}`,
      player: currentPlayer.value,
      movement: [x, y],
      prevGameState: _game,
      nextGameState: tmpGame,
      timestamp: Date.now(),
      next: 1
    })
    _game = tmpGame
    startGame()
  }
}
</script>

<style>
table>tr>td {
  width: 60px;
  height: 60px;
  text-align: center;
  border-color: gray;
  border-style: solid;
  border-width: 1px;
  cursor: pointer;
}

.cell-white {
  background-color: white;
  color: black;
}

.cell-black {
  background-color: black;
}

.cell-empty {
  background-color: transparent;
}

.can-place-piece {
  border-color: red;
}
</style>

<template>
  <div>
    <table id="board">
      <!-- <tr v-for="(row, rowIndex) in game" :key="rowIndex">
        <td
          v-for="(cell, cellIndex) in row"
          :key="cellIndex"
          :class="{
            'cell-empty': cell === CellValue.EMPTY,
            'cell-white': cell === CellValue.WHITE,
            'cell-black': cell === CellValue.BLACK,
            'can-place-piece': canPlacePiece(cellIndex, rowIndex, cell)
          }"
          @click="makeMove(rowIndex, cellIndex, cell)"
        >
          {{ rowIndex }}, {{ cellIndex }}, {{ cell }} {{  canPlacePiece(cellIndex, rowIndex, cell)  }}
        </td>
      </tr> -->
    </table>
  </div>
</template>
