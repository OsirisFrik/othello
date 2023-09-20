import SocketClient from '../socket'

export interface GameRoom {
  room: string
  game?: string | null
  maxPlayers: number
  players: Map<string, Player>
}

export interface GameRoomClient extends Omit<GameRoom, 'players'> {
  players: Player[]
}

export interface Player {
  id: string
  nickname?: string
  isOwner: boolean
}

interface MultiplayerConfig {
  room: string
  maxPlayers?: number
  autoConnect?: boolean
}

interface ClientToServerEvents {
  room_join: (room: string, config?: Partial<GameRoomClient>) => void
}

export interface ServerToClientEvents {
  room_joined: (room: string, config?: Partial<GameRoom>) => void
  player_joined: (player: Player) => void
}

export default class Multiplayer {
  #socket: SocketClient<ServerToClientEvents, ClientToServerEvents>
  #room: string
  #maxPlayers: number
  #players: Map<string, Player> = new Map()
  #gameState: any
  
  constructor({
    room,
    maxPlayers = 2,
    autoConnect = false
  }: MultiplayerConfig) {

    this.#room = room
    this.#maxPlayers = maxPlayers
    this.#socket = new SocketClient()

    this.#socket.onEvent('room_full', () => this.#onRoomFull)
    this.#socket.onEvent('player_join', this.#onPlayerJoin)
    this.#socket.onEvent('player_leave', this.#onPlayerLeave)
    this.#socket.onEvent('sync_game', this.#onSyncGame)
    this.#socket.onEvent('connect', () => this.#onConnect())
    this.#socket.onEvent('start_game', () => this.#onStartGame)
    
    if (autoConnect) this.#socket.connect()
  }

  #onConnect() {
    this.#joinToRoom()
  }

  #joinToRoom() {
    this.#socket.send('room_join', {
      room: this.#room,
      maxPlayers: this.#maxPlayers
    })
  }

  #onPlayerJoin(event: Player) {
    this.#players.set(event.id, event)
    this.onPlayerJoin(event)
  }

  #onPlayerLeave(player: Player) {
    this.#players.delete(player.id)
    this.onPlayerLeave(player)
  }

  #onRoomFull(event: any) {
    this.onError('room_full', event)
  }

  #onStartGame() {}

  #onSyncGame(event: any) {
    try {
      this.#gameState = event
      this.onSyncGame(event)
    } catch (err) {
      console.trace(err)
    }
  }

  onOpponentMove(event: any) {
    console.log('opponent_move event not implemented yet', event)
  }

  onError(type: string, error: any) {
    console.log('error event not implemented yet')
    console.log(type, error)
  }

  playerMove() {
    console.log('playerMove not implemented yet')
  }

  onPlayerJoin(evnet: Player) {
    console.log('player_join event not implemented yet', evnet)
  }

  onPlayerLeave(evnet: Player) {
    console.log('player_leave event not implemented yet', evnet)
  }

  onSyncGame(gameState: any) {
    console.log('sync_game event not implemented yet', gameState)
  }
}
