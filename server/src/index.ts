import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { GameRoomManager } from './modules/room'

const app = express()

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
  }
})
const gameRoomManager = new GameRoomManager(io)

server.listen(
  process.env.PORT ?? 3000,
  () => console.log(`Othello server listening on port ${process.env.PORT || 3000}!`)
)
