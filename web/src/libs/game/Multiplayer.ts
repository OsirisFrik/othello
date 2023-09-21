import SocketClient from '../socket'

export interface GameState<G = any> {
  id: string
  game: string
  state: G
}

export interface GameRoom<G = any> {
  room: string
  game?: string | null
  maxPlayers: number
  players: Map<string, Player>
  gameState: GameState<G>
  history: GameState<G>[]
}

export interface GameRoomClient extends Omit<GameRoom, 'players'> {
  players: Player[]
}

export interface Player<G = any> {
  id: string
  nickname?: string
  isOwner: boolean
  gameState: G
}

interface MultiplayerConfig<G = any> {
  room: string
  maxPlayers?: number
  autoConnect?: boolean
  gameState: GameState<G>
}

interface ClientToServerEvents<G = any> {
  room_join: (room: string, config?: Partial<GameRoomClient>) => void
}

export interface ServerToClientEvents<G = any>{
  room_joined: (room: string, config?: Partial<GameRoom>) => void
  room_full: (room: string, config?: Partial<GameRoom>) => void
  player_join: (player: Player) => void
  player_leave: (player: Player) => void
  sync_game: (game: GameState<G>) => void
  start_game: (game: GameState<G>) => void
}

export default class Multiplayer <
  G = any,
  GameEventsServerToCLient extends ServerToClientEvents<G> = ServerToClientEvents<G>,
  GameEventsClientToServer extends ClientToServerEvents<G> = ClientToServerEvents<G>
> {
  #socket: SocketClient<
    GameEventsServerToCLient,
    GameEventsClientToServer
  >
  #room: string
  #maxPlayers: number
  #players: Map<string, Player> = new Map()
  #gameState: GameState<G>
  
  constructor({
    room,
    maxPlayers = 2,
    autoConnect = false,
    gameState
  }: MultiplayerConfig) {

    this.#room = room
    this.#maxPlayers = maxPlayers
    this.#gameState = gameState
    this.#socket = new SocketClient()

    // @ts-expect-error
    this.#socket.socket.on('room_full', this.#onRoomFull.bind(this))
    // @ts-expect-error
    this.#socket.socket.on('player_join', this.#onPlayerJoin.bind(this))
    // @ts-expect-error
    this.#socket.socket.on('player_leave', this.#onPlayerLeave.bind(this))
    // @ts-expect-error
    this.#socket.socket.on('sync_game', this.#onSyncGame.bind(this))
    this.#socket.socket.on('connect', this.#onConnect.bind(this))
    // @ts-expect-error
    this.#socket.socket.on('start_game', this.#onStartGame.bind(this))
    
    if (autoConnect) this.#socket.connect()
  }

  #onConnect(): void {
    this.#joinToRoom(this.#room)
  }

  #joinToRoom(room: string): void {
    console.log('joining to room', room)
    this.#socket.send('room_join', {
      room,
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

  #onSyncGame(game: GameState<G>): void {
    try {
      this.#gameState = game
      this.onSyncGame(game)
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
