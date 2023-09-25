import type { EventsMap, DefaultEventsMap, EventNames, EventParams } from '@socket.io/component-emitter'
import io, { type Socket } from 'socket.io-client'

export default class SocketClient<
  ListenEvents extends EventsMap = DefaultEventsMap,
  EmitEvents extends EventsMap = ListenEvents
> {
  socket: Socket<ListenEvents, EmitEvents> = io(
    import.meta.env.VITE_SOCKET_SERVER,
    { autoConnect: false }
  )

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

  send<K extends EventNames<EmitEvents>>(event: K, ...args: EventParams<EmitEvents, K>) {
    this.socket.emit(event, ...args)
  }

  onEvent<K extends EventNames<ListenEvents>>(event: K, callback: ListenEvents[K]) {
    this.socket.on(event, callback)
  }
}
