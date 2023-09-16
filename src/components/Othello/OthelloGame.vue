<script setup lang="ts">
import { ref } from 'vue'

enum CellValue {
  EMPTY,
  WHITE,
  BLACK
}

const game = ref<CellValue[][]>(Array(8).fill(0).map(() => Array(8).fill(CellValue.EMPTY)))
const currentPlayer = ref<CellValue>(CellValue.BLACK)

game.value[3][3] = CellValue.WHITE
game.value[3][4] = CellValue.BLACK
game.value[4][3] = CellValue.BLACK
game.value[4][4] = CellValue.WHITE
game.value[3][2] = CellValue.BLACK
game.value[2][2] = CellValue.WHITE

function invertPlayer() {
  return currentPlayer.value === CellValue.BLACK? CellValue.WHITE : CellValue.BLACK
}

function validateMove(x: number, y: number): boolean {
  const value = currentPlayer.value

  if (game.value[x][y] !== CellValue.EMPTY) {
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
      const cellValue = game.value[i][j]

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

function makeMove(x: number, y: number) {
  const value = currentPlayer.value

  if (!validateMove(x, y)) {
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
      const cellValue = game.value[i][j]

      if (cellValue === CellValue.EMPTY) {
        break
      }

      if (cellValue === value) {
        if (foundOpponent) {
          // Cambiar las fichas del oponente capturadas.
          while (i !== x || j !== y) {
            i -= dx
            j -= dy
            game.value[i][j] = value
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
  }
}

function canPlacePiece(x: number, y: number): boolean {
  const value = currentPlayer.value

  if (game.value[x][y] !== CellValue.EMPTY) {
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

    // Verificar si estamos dentro de los límites del tablero.
    if (i >= 0 && i < 8 && j >= 0 && j < 8) {
      const firstCell = game.value[i][j]

      // Verificar si la primera celda en la dirección es una ficha del oponente.
      if (firstCell !== CellValue.EMPTY && firstCell !== value) {
        foundOpponent = true
      }

      // Continuar verificando la dirección.
      while (i >= 0 && i < 8 && j >= 0 && j < 8) {
        const cellValue = game.value[i][j]

        if (cellValue === CellValue.EMPTY) {
          break
        }

        if (cellValue === value) {
          if (foundOpponent) {
            // Si se encuentra al menos una ficha del oponente seguida por una propia
            // en esta dirección, el movimiento es válido en esta dirección.
            return true
          }
          break
        } else {
          // Encontrar una ficha del oponente.
          foundOpponent = true
        }

        i += dx
        j += dy
      }
    }
  }

  // Si no es válido en ninguna dirección, el movimiento no es válido.
  return false
}

</script>

<style>
table>tr>td {
  width: 40px;
  height: 40px;
  text-align: center;
  border-color: gray;
  border-style: solid;
  border-width: 1px;
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
  border-color: green;
}
</style>

<template>
  <div>
    <table>
      <tr v-for="(row, rowIndex) in game" :key="rowIndex">
        <td
          v-for="(cell, cellIndex) in row"
          :key="cellIndex"
          :class="{
            'cell-empty': cell === CellValue.EMPTY,
            'cell-white': cell === CellValue.WHITE,
            'cell-black': cell === CellValue.BLACK,
            'can-place-piece': canPlacePiece(cellIndex, rowIndex)
          }"
          @click="makeMove(rowIndex, cellIndex)"
        >
          {{ rowIndex }}, {{ cellIndex }}, {{  cell }} {{  canPlacePiece(cellIndex, rowIndex)  }}
        </td>
      </tr>
    </table>
  </div>
</template>
