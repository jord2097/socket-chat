const path = require('path')
const http = require('http')
const express = require('express');
const socketio = require('socket.io')
const formatMessage = require('./helpers/formatDate')
const {
    getActiveUser,
    exitRoom,
    newUser,
    getIndividualRoomUsers,
} = require('./helpers/userHelper')

const app = express();
const server = http.createServer(app)
const io = socketio(server)

//set public folder
app.use(express.static(path.join(__dirname, 'public')))

// on client connection
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room}) => {
        const user = newUser(socket.id, username, room)

        socket.join(user.room)

        // welcome msg
        socket.emit('message', formatMessage("SocketChat", 'Messages are limited to this room!'))

        // user enters room
        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                formatMessage("SocketChat", `${user.username} has joined the room`)                
            )
        
        // get active users and room name
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getIndividualRoomUsers(user.room)
        })
    })

    // listen for message from client
    socket.on('chatMessage', msg => {
        const user = getActiveUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    // on client disconnect
    socket.on('disconnect', () => {
        const user = exitRoom(socket.id)
        if (user) {
            io.to(user.room).emit(
                'message',
                formatMessage("SocketChat", `${user.username} has left the room.`)
            )
            
            // current active users and room name
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getIndividualRoomUsers(user.room)
            })

        }
    })
})

const PORT = 3000 || process.env.PORT
server.listen(PORT, () => console.log(`App listening on http://localhost:${PORT}`));
