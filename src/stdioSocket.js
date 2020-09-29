const config = require('./config');
const fs = require('fs/promises');
const { Readable, Writable } = require('stream');
const net = require('net');

async function cleanupSocketFile(warn= false) {
    const { socketFile } = config;
    return await fs.stat(socketFile).then(() => {
        if(warn) console.warn(`Socket file found at ${socketFile}. This may have been because the process quit unexpectedly. Replacing file.`);
        return fs.unlink(socketFile);
    }, error => { 
        /* File not found is an expected error */
        if(error.code !== 'ENOENT') {
            throw error;
        }
    });
}


async function createStdioSocketServer(input = process.stdin, output = process.stdout) {
    // Verify types
    if(!(input instanceof Readable)) {
        throw new TypeError('Input must be Readable');
    }
    if(!(output instanceof Writable)) {
        throw new TypeError('Output must be Writable');
    }

    const { socketFile } = config;

    await cleanupSocketFile(true);

    // Create IPC server:
    const server = net.createServer(socket => {
        socket.pipe(output, { end: false });    // don't close the ouput stream if the socket is closed from the other side. We want to allow the socket to be connected/disconnected many times.
        input.pipe(socket);
    });
    
    await new Promise((resolve,reject) => {
        // To catch any listener errors: 
        // NOTE: It looks like Sockets can't be opened on removeable media devices on mac: 
        // https://github.com/nodejs/node/issues/19195#issuecomment-375035527 > "(...) macos only supports file socket with Mac OS Extended (Journaled) or HFS Plus"

        server.once('error', reject);

        server.listen(socketFile, () => {
            server.removeListener('error', reject);
            // TODO: LINUX: CHMOD the socketfile to be writable by the group
            resolve();
        });
    });
    console.log(`Socket file opened at ${socketFile}`);
    
    server.once('close', () => {
        // Cleanup socket
        cleanupSocketFile();
    });

    return server;
}

async function connectToSocket(input = process.stdin, output = process.stdout) {
    // Verify types
    if (!(input instanceof Readable)) {
        throw new TypeError('Input must be Readable');
    }
    if (!(output instanceof Writable)) {
        throw new TypeError('Output must be Writable')
    }

    // Make sure socket file exists
    await fs.stat(config.socketFile);

    // Attempt to connect
    const socket = await new Promise((resolve, reject) => {
        try {
            const s = net.connect(config.socketFile, () => {
                resolve(s);
            })
        } catch( error ) {
            reject(error);
        }
    });

    socket.pipe(output);
    input.pipe(socket);

    return socket;
}

module.exports = {
    createStdioSocketServer,
    connectToSocket
};
