const net = require('net');
const {Socket} = net;
const { 
    readVarInt, writeVarInt, writeString, readString, writeUint16
} = require('./protocolTypes');

async function createSocket(port, host) {
    return new Promise((resolve, reject) => {
        try {
            const connection = net.createConnection(port, host, () => {
                return resolve(connection);
            });
            connection.once('error', (e) => {
                reject(e);
            });
        } catch(e) { 
            reject(e);
        }
    });
}

async function socketWrite(socket, data) {
    return new Promise(r => socket.write(data,r));
}

/**
 *  Length 	VarInt 	Length of Packet ID + Data
    Packet ID 	VarInt
    Data 	Byte Array 	Depends on the connection state and packet ID, see the sections below
 * @param {Socket} socket 
 * @param {Buffer} packet should include packetID and any data
 */
async function sendPacket(socket, packet) {
    const packetLength = writeVarInt(packet.length);
    return socketWrite(socket, Buffer.concat([packetLength, packet]));
}


async function handshake(socket, login = false) {
    if(!(socket instanceof Socket)) {
        throw new TypeError(`Expected Socket, got ${typeof socket}`);
    }
    // Create packets
    const packetID = Buffer.alloc(1, 0);

    const packet = Buffer.concat([
        packetID,
        writeVarInt(736),   // Protocol version (fixed, but might be changed to -1 for discovery)
        writeString(socket.remoteAddress), // Server address
        writeUint16(socket.remotePort),
        writeVarInt(login ? 2 : 1) // Status
    ]);

    // Send packets
    return sendPacket(socket, packet);
}


// Wrappers
async function getServerStatus(socket) {

    // Local Variables
    let receivedData = Buffer.alloc(0);
    let promiseResolver, promiseRejector;
    let dataPromise = new Promise((resolve, reject) => {
        promiseResolver = resolve;
        promiseRejector = reject;
    });
    // Set up socket listeners:
    const onData = newData => {
        // Add new Data to end of buffer:
        receivedData = Buffer.concat([receivedData, newData]);

        // Check if we have the full data
        const packetLength = readVarInt(receivedData);
        if (packetLength.val === (receivedData.length - packetLength.len)) {
            // Remove this listener
            socket.removeListener('data', onData);

            try {
                // Extract string and resolve
                let buff = receivedData.slice(readVarInt(receivedData).len); // Strip out packet length
                buff = buff.slice(readVarInt(buff).len);                     // Strip out packetId
                promiseResolver(JSON.parse(readString(buff)));               // pull out and parse the string
            } catch (e) {
                promiseRejector(e);
            }

        }
    };
    socket.on('data', onData);

    
    // send handshake and request
    await handshake(socket);
    await sendPacket(socket, Buffer.alloc(1, 0)); // Request packet

    // Return data:
    return dataPromise;
}

module.exports = {
    createSocket,
    getServerStatus,
    handshake
};
