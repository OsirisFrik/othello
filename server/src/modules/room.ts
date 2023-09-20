import { Server, Socket } from 'socket.io'

export interface Player {
  id: string
  nickname?: string
  isOwner: boolean
  socketId: string
}

export interface GameRoom {
  room: string
  game?: string | null
  maxPlayers: number
  players: Map<string, Player>
}

export interface GameRoomClient extends Omit<GameRoom, 'players'> {
  players: Player[]
}

interface ClientToServerEvents {
  room_join: (room: string, config?: Partial<GameRoomClient>) => void
}

export interface ServerToClientEvents {
  room_joined: (room: string, config?: Partial<GameRoom>) => void
  player_joined: (player: Player) => void
}

export class GameRoomManager {
  rooms: Map<string, GameRoom> = new Map()
  io: Server<ClientToServerEvents, ServerToClientEvents>

  constructor(io: Server) {
    this.io = io

    this.io.on('connection', (socket) => {
      socket.on('room_join', (room, config) => this.roomJoin(socket, room, config))
    })
  }

  roomJoin(socket: Socket, room: string, config?: Partial<GameRoomClient>) {
    const player: Player = {
      id: socket.id,
      isOwner: false,
      socketId: socket.id,
    }

    if (!this.rooms.has(room)) {
      const players = new Map<string, Player>()

      player.isOwner = true
      players.set(socket.id, player)

      if (config?.players && config.players.length > 0) {
        for (const player of config.players) {
          players.set(player.id, player)
        }
      }
      
      this.rooms.set(room, {
        room,
        players,
        game: config?.game,
        maxPlayers: config?.maxPlayers ?? 1,
      })

      console.log(`Room ${room} created`)
    }

    const _room = this.rooms.get(room)!

    socket.join(room)
    socket.emit('room_joined', _room)

    if (!player.isOwner) this.io.to(room).emit('player_joined', player)
  }
}
