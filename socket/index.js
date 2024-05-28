import { Server } from 'socket.io';

const io = new Server({
    cors: {
        origin: 'http://localhost:3000'
    }
})

let onlineUsers = []

const addUser = (username, firstname, lastname, socketId) => {
    !onlineUsers.some((user) => user.username === username) &&
        onlineUsers.push({ username, firstname, lastname, socketId })
}

const deleteUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId)
}

const getUser = (username) => {
    return onlineUsers.find((user) => user.username === username)
}

io.on('connection', (socket) => {

    socket.on('newUser', (username, firstname, lastname) => {
        addUser(socket.id, username, firstname, lastname)
        console.log('new user added', onlineUsers)
    })

    socket.on('sendNotification', ({
        senderName,
        receiverName,
        type,
    }) => {
        const receiver = getUser(receiverName)
        console.log('receiver', receiver)
        io.to(receiver?.socketId).emit('getNotification', {
            senderName,
            type,
        })
    })

    socket.on('disconnect', () => {
        deleteUser(socket.id)
    })
})

io.listen(8000)