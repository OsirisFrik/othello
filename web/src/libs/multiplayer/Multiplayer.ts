import type { EventNames } from '@socket.io/component-emitter'

import SocketClient from '@/libs/socket'
import { GameRoom, type GameRoomData } from './GameRoom'
import { GameState, type GameStateData } from './GameState'
import { Player, type PlayerData } from './Player'
import { Movement, type MovementData } from './Movement'

export interface MultiplayerConfig<G = any> {
  room: string
  maxPlayers?: number
  minPlayers?: number
  autoConnect?: boolean
  gameState: GameState<G>
  player: Player
}

export interface EmitEvents<G = any, M = any, P = any> extends ListenEvents<G, M, P> {
  room_join: (
    room: string,
    player: PlayerData<P> | Player<P>,
    config?: Partial<GameRoomData | GameRoom>
  ) => void
  room_leave: (room: string) => void
  start_game: () => void
  game_end: () => void
  restart_game: () => void
  player_move: (movement: MovementData<M, P> | Movement<M, P>) => void
}

export interface ListenEvents<G = any, M = any, P = any> {
  room_joined: (room: string, config?: Partial<GameRoomData>) => void
  room_full: (room: string, config?: Partial<GameRoomData>) => void
  player_join: (
    player: PlayerData<P> | Player<P>,
    room: Partial<GameRoomData>
  ) => void
  player_leave: (player: PlayerData<P> | Player<P>) => void
  player_move: (movement: MovementData<M, P> | Movement<M, P>) => void
  sync_game: (game: GameState<G>) => void
  start_game: (game: GameState<G>) => void
  set_owner: (player: PlayerData<P> | Player<P>) => void
}

export class Multiplayer <
  G,
  GameMovement,
  PlayerGameState,
  GameListenEevents extends ListenEvents<G, GameMovement, PlayerGameState> = ListenEvents<G>,
  GameEmitEvents extends EmitEvents<G, GameMovement, PlayerGameState> = EmitEvents<G>,
> extends EventTarget {
  #socket: SocketClient<
    GameListenEevents,
    GameEmitEvents
  >
  #room: string
  #maxPlayers: number
  #minPlayers: number
  #players: Map<string, Player> = new Map()
  #gameState: GameState<G>
  #player: Player
  
  constructor({
    room,
    maxPlayers = 2,
    minPlayers = 2,
    autoConnect = false,
    gameState,
    player
  }: MultiplayerConfig) {
    super()
    
    this.#room = room
    this.#maxPlayers = maxPlayers
    this.#minPlayers = minPlayers
    this.#gameState = gameState
    this.#socket = new SocketClient()
    this.#player = player

    this.#socket.socket.on('connect', this.#onConnect.bind(this))
    // @ts-expect-error
    this.#socket.socket.on('room_full', this.#onRoomFull.bind(this))
    // @ts-expect-error
    this.#socket.socket.on('room_joined', this.#onRoomJoined.bind(this))
    // @ts-expect-error
    this.#socket.socket.on('player_join', this.#onPlayerJoin.bind(this))
    // @ts-expect-error
    this.#socket.socket.on('player_leave', this.#onPlayerLeave.bind(this))
    // @ts-expect-error
    this.#socket.socket.on('sync_game', this.#onSyncGame.bind(this))
    // @ts-expect-error
    this.#socket.socket.on('start_game', this.#onStartGame.bind(this))
    // @ts-expect-error
    this.#socket.socket.on('set_owner', this.#onSetOwner.bind(this))
    
    if (autoConnect) this.#socket.connect()
  }

  get player() {
    return this.#player
  }

  #onConnect(): void {
    this.#joinToRoom(this.#room)
  }

  #joinToRoom(room: string): void {
    // @ts-expect-error
    this.#socket.send('room_join', room, this.#player, this.#gameState)
  }

  #onRoomJoined(): void {}

  #onSetOwner(player: Player): void {
    if (player.id === this.#player.id) {
      this.#player.isOwner = true
    } else {
      this.#player.isOwner = false
      this.#players.get(player.id)!.isOwner = true
    }
  }

  #onPlayerJoin(player: PlayerData) {
    if (player.id === this.#player.id) return

    console.log(`Player ${player.id} joined`)
    
    this.#players.set(player.id, new Player(player))

    this.#dispatchGameEvent('player_join', new Player(player))
  }

  #onPlayerLeave(player: PlayerData) {
    this.#players.delete(player.id)
    
    this.#dispatchGameEvent('player_leave', new Player(player))
  }

  #onRoomFull(event: any) {
    this.#dispatchGameEvent('room_full', event)
  }

  #onStartGame() {
    this.#dispatchGameEvent('start_game', this.#gameState)
  }

  #onSyncGame(game: GameStateData<G>): void {
    try {
      this.#gameState = new GameState(game)
      
      this.#dispatchGameEvent('sync_game', this.#gameState)
    } catch (err) {
      console.trace(err)
    }
  }

  #dispatchGameEvent<K extends EventNames<ListenEvents<G>>>(event: K, ...args: any[]): boolean {
    return super.dispatchEvent(
      new CustomEvent(event as string, ...args)
    )
  }

  addGameEventListener<K extends EventNames<ListenEvents<G>>>(
    event: K,
    callback: ListenEvents<G>[K]
  ): void {
    super.addEventListener(event as string, callback as any)
  }

  playerMove(
    player: Player<PlayerGameState>,
    movement: GameMovement
  ): Movement<GameMovement, PlayerGameState> {
    const _movement = new Movement({
      player,
      movement,
      room: this.#room
    })

    // @ts-expect-error
    this.#socket.send('player_move', _movement)

    return _movement
  }

  startGame(): boolean {
    if (this.player.isOwner) {
      // this.#socket.send('start_game')

      return true
    }

    return false
  }

  restartGame(): boolean {
    if (this.player.isOwner) {
      // this.#socket.send('restart_game')

      return true
    }

    return false
  }
}
