async function closeSocket(socket) {
    return new Promise(resolve => {
        socket.once('close', resolve);
        socket.end();
    })
}

module.exports = {
    closeSocket
};