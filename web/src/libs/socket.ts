import io from 'socket.io-client'

export type GameState = number[][]

export interface MovementMessage {
  room: string
  player: 1 | 2
  next: 1 | 2
  movement: number[]
  movements: GameState
  prevGameState: GameState
  nextGameState: GameState
  timestamp: number
}


export default class SocketClient {
  socket = io(import.meta.env.VITE_SOCKET_SERVER, { autoConnect: false })

  constructor() {
    this.socket.on('connect', () => {
      console.log('Connected to socket server')
    })
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server')
    })

    this.socket.on('message', (data) => {
      console.log(data)
    })

    this.socket.on('error', (error) => {
      console.log(error)
    })
  }

  connect() {
    this.socket.connect()
  }

  disconnect() {
    this.socket.disconnect()
  }

  send(event: string, data?: any) {
    this.socket.emit(event, data)
  }

  on(event: string, callback: (data: any) => void) {
    this.socket.on(event, callback)
  }

  sendMovement(movement: MovementMessage) {
    this.send('movement', movement)
  }
}
