const socketIo = require('socket.io');

function initSocket(server) {
    const io = socketIo(server); // Initialize io here

    io.on('connection', (socket) => {
        console.log("A user connected");

        // Send a welcome message to the client
        socket.emit('welcome', 'Welcome to the Dog App!');
        console.log("✅ Sent 'welcome' event to client");

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('❌ User disconnected');
        });
    });

    return io;
}

module.exports = {
    initSocket
};
