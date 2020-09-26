const net = require('net');
const config = require('./config');
const MinecraftServer = require('./minecraft/server');

// Startup the TCP server:
module.exports = async function startTcpProxy() {
    // Create server with preconfigured connection listner.
    const server = net.createServer(async (localsocket) => {
        // Ensure the minecraft server is up
        await MinecraftServer.start();
        
        // Connect to the remote host
        const remotesocket = new net.Socket();
        remotesocket.connect(config.serverPort, 'localhost');

        // Proxying and connection closing
        localsocket.on('connect', (data) => {
            console.log(`>>> connection #${server.connections} from ${localsocket.remoteAddress}:${localsocket.remotePort}\n\t${data}`);
        });

        localsocket.on('data', (data) => {
            if (!remotesocket.write(data)) {
                localsocket.pause();
            }
        });

        remotesocket.on('data', (data) => {
            if (!localsocket.write(data)) {
                remotesocket.pause();
            }
        });

        localsocket.on('drain', () => {
            remotesocket.resume();
        });

        remotesocket.on('drain', () => {
            localsocket.resume();
        });

        localsocket.on('close', (had_error) => {
            console.debug(`Local socket closing${had_error ?' due to an error' : ''}`);
            remotesocket.end();
        });

        remotesocket.on('close', had_error => {
            console.debug(`Remote socket closing${had_error ? ' due to an error' : ''}`);
            localsocket.end();
        });

        localsocket.on('error', error => {
            console.error('Error with localsocket: ', error);
        }); 
        remotesocket.on('error', error => {
            console.error('Error with remotesocket: ', error);
        }); 

    });

    
    // Start server
    console.log(`[DEBUG] Starting TCP proxy on ${config.proxyPort}`);
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(config.proxyPort, () => {
            server.removeListener('error', reject);
            resolve();
        });
        
    });

    server.on('error', error => {
        console.error('TCP Server error: ', error);
    })

    return server;
}
