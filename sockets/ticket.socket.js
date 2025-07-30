let ioInstance;

const initTicketSocket = (io) => {
    ioInstance = io;

    io.on('connection', (socket) => {
        console.log('User connected', socket.id);

        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`socket ${socket.id} joined room ${roomId}`)
        });
    });
}

const emitRoomDataChanged = (screening) => {
    
    if (!ioInstance) {
        console.warn('Socket.IO not initialized yet!');
        return;
    }

    if (!screening || !screening.id_room) {
        console.warn('Invalid screening object when emitting!');
        return;
    }

    ioInstance.to(screening.id_room).emit('room_data_changed', {
        id_screening: screening._id,
        id_room: screening.id_room,
    });

    console.log(`📡 Emit room_data_changed to room ${screening.id_room}`);
}

module.exports = {
    initTicketSocket,
    emitRoomDataChanged,
};