enum CellValue {
  EMPTY,
  WHITE,
  BLACK
}

export interface Player {
  id: string
  nickname?: string
  isOwner: boolean
}

export interface GameRoom {
  room: string
  players: Player[]
}

export async function validateMove(
  x: number,
  y: number,
  game: any,
  player: CellValue
): Promise<boolean> {
  console.log(x, y, game[x][y], player)
  if (game[x][y] !== CellValue.EMPTY) {
    // La celda no está vacía, no se puede colocar una ficha aquí.
    console.log('La celda no está vacía, no se puede colocar una ficha aqui.')
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
      const cellValue = game[i][j]

      if (cellValue === CellValue.EMPTY) {
        break
      }

      if (cellValue === player) {
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
  console.log('No se encontró al menos una dirección válida.')
  return false
}
