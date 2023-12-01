import Debug, { Debugger } from 'debug'
import { Server, Socket } from 'socket.io'

const debug = Debug('app:room')

export interface Player<P = any> {
  id: string
  nickname?: string
  isOwner: boolean
  socketId: string
  gameState?: P
}

export interface GameRoom {
  room: string
  game?: string | null
  maxPlayers: number
  players: Map<string, Player>
  log: Debugger
}

export interface GameRoomClient extends Omit<GameRoom, 'players'> {
  players: Player[]
}

export interface GameState<G = any> {
  id: string
  game: string
  state: G
}

export interface Movement<M = any, P = any> {
  id?: string
  room: string
  player: Player<P>
  movement: M
  timestamp?: number
}

interface ListenEvents {
  room_join: (room: string, player: Player, config?: Partial<GameRoomClient>) => void
  room_leave: (room: string) => void
  start_game: () => void
  game_end: () => void
  restart_game: () => void
  player_move: (movement: Movement) => void
}

export interface EmitEvents {
  room_joined: (room: string, config?: Partial<GameRoom>) => void
  room_full: (room: string, config?: Partial<GameRoom>) => void
  player_join: (player: Player) => void
  player_leave: (player: Player) => void
  player_move: (movement: Movement) => void
  sync_game: (game: GameState) => void
  start_game: (game: GameState) => void
  set_owner: (player: Player) => void
}

export class GameRoomManager {
  rooms: Map<string, GameRoom> = new Map()
  io: Server<ListenEvents, EmitEvents>

  constructor(io: Server) {
    this.io = io

    debug('Initializing GameRoomManager')

    this.io.on('connection', (socket) => {
      debug('new socket connected')

      socket.on('room_join', this.roomJoin.bind(this, socket))
      socket.on('player_move', this.onPlayerMove.bind(this, socket))
    })
  }

  onPlayerMove(socket: Socket, movement: Movement) {
    if (this.rooms.has(movement.room)) {
      const room = this.rooms.get(movement.room)

      room?.log(`Player ${movement.player.nickname} moved in room ${movement.room}`)

      this.io.to(movement.room).emit('player_move', movement)
    }
  }

  roomJoin(socket: Socket, room: string, player: Player, config?: Partial<GameRoomClient>) {
    const log = Debug(`app:room:${room}`)

    log(`Event on room ${room} by player ${player.nickname}`)

    if (!this.rooms.has(room)) {
      const players = new Map<string, Player>()

      log(`Room ${room} created by player ${player.nickname}`)

      player.isOwner = true
      players.set(socket.id, player)

      if (config?.players && config.players.length > 0) {
        for (const _player of config.players) {
          players.set(_player.id, _player)
        }
      }

      this.rooms.set(room, {
        log,
        room,
        players,
        game: config?.game,
        maxPlayers: config?.maxPlayers ?? 2
      })

      log(`Room ${room} created`)
      socket.emit('set_owner', player)
    } else {
      log(`Player ${player.nickname} tried to join room ${room}`)

      const _room = this.rooms.get(room)!

      if (_room.players.size >= _room.maxPlayers) {
        socket.emit('room_full', _room)
        debug(`Player ${player.nickname} tried to join room ${room}, but room is full`)

        return
      }

      _room.players.set(socket.id, player)
      socket.emit('room_joined', _room.room, _room)

      let owner = Array.from(_room.players.values())
        .find((_player) => _player.isOwner)

      if (!owner) {
        player.isOwner = true
        owner = player

        _room.players.set(socket.id, player)
      }

      socket.emit('set_owner', owner)
    }

    const _room = this.rooms.get(room)!

    socket.join(room)
    socket.emit('room_joined', _room.room, _room)
    socket.broadcast.to(room).emit('player_join', player)
  }
}
