import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { validateMovements } from './game'

const app = express()

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
  }
})

io.on('connection', (socket) => {
  console.log('A user connected!')

  socket.on('join', async ({ room }) => {
    await socket.join(room)
    console.log(`User ${socket.id} joined room ${room}`)
  })

  socket.on('movement', async (data: MovementMessage) => {
    console.log(data)
    if (await validateMovements(data.movements, data.prevGameState)) {
      io.to(data.room).emit('movement', data)
    }
  })
})

server.listen(
  process.env.PORT ?? 3000,
  () => console.log(`Othello server listening on port ${process.env.PORT || 3000}!`)
)
