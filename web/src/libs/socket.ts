import type { EventsMap, DefaultEventsMap } from '@socket.io/component-emitter'
import io, { type Socket } from 'socket.io-client'
import type { CellValue } from './enum'

export type GameState = number[][]

export interface MovementMessage {
  room: string
  player: CellValue
  next: CellValue
  movement: number[]
  movements: GameState
  prevGameState: GameState
  nextGameState: GameState
  timestamp: number
}


export default class SocketClient<
  ServerToClientEvents extends EventsMap = DefaultEventsMap,
  ClientToServerEvents extends EventsMap = ServerToClientEvents
> {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(import.meta.env.VITE_SOCKET_SERVER, { autoConnect: false })

  constructor() {
    this.socket.on('connect', () => {
      console.log('Connected to socket server')
    })
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server')
    })

    this.socket.on('connect_error', (err) => console.trace(err))
  }

  connect() {
    this.socket.connect()
  }

  disconnect() {
    this.socket.disconnect()
  }

  send(event: string, data?: any) {
    // @ts-ignore
    this.socket.emit(event, data)
  }

  onEvent(event: string, callback: (...args: any[]) => void) {
    // @ts-ignore
    this.socket.on(event, callback)
  }

  sendMovement(movement: MovementMessage) {
    this.send('movement', movement)
  }
}
