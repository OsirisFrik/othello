/* eslint-disable no-process-env */
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { GameRoomManager } from './modules/room'
import Debug from 'debug'

Debug.log = console.log.bind(console)

const debug = Debug('app:server')
const app = express()

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*'
  }
})

server.listen(
  process.env.PORT ?? 3000,
  () => {
    const manager = new GameRoomManager(io)

    debug(`Othello server listening on port ${process.env.PORT || 3000}!`, manager.rooms)
  }
)
