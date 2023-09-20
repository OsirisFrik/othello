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

export default class Multiplayer extends SocketClient<ServerToClientEvents, ClientToServerEvents> {
  #room: string
  #maxPlayers: number
  #players: Map<string, Player> = new Map()
  #gameState: any
  
  constructor({
    room,
    maxPlayers = 2,
    autoConnect = false
  }: MultiplayerConfig) {
    super()

    this.#room = room
    this.#maxPlayers = maxPlayers

    this.onEvent('room_full', () => this.#onRoomFull)
    this.onEvent('player_join', this.#onPlayerJoin)
    this.onEvent('player_leave', this.#onPlayerLeave)
    this.onEvent('sync_game', this.#onSyncGame)
    this.onEvent('connect', () => this.#onConnect())
    
    if (autoConnect) this.connect()
  }

  #onConnect() {
    this.#joinToRoom()
  }

  #joinToRoom() {
    this.send('room_join', {
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
