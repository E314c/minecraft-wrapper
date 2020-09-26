const { spawn } = require('child_process');
const EventEmitter = require('events');
const config = require('../config');
const {getServerStatus, createSocket} = require('./protocol');
const {closeSocket} = require('./socketUtil');

class MinecraftServer extends EventEmitter {
    

    constructor() {
        super();
        this.serverProcess = null;

        this.lastCheckHadPlayers = true;
        this.playerCheckInterval = null;
    }

    async start () {
        // If process is there, return now
        if(this.serverProcess) {
            return;
        }
        console.log('Server not up, starting: ', (new Date()).toISOString());
       this.startProcess();

        // Start the status checks
        let statusIsResolved = false;
        const serverIsLive = (async function () {
            let isLive = false;
            let socket;
            do {
                try {
                    // Always have a new socket
                    if(socket) {
                        await closeSocket(socket);
                    }
                    socket = await createSocket(config.serverPort, 'localhost');
                    
                    const serverStatus = await getServerStatus(socket);

                    isLive = serverStatus && serverStatus.version && serverStatus.version.protocol;
                } catch (error) {
                    // TODO: Filter out any expected errors, such as network unreachable (server not started)
                    if (!(
                        error.code === 'ECONNREFUSED' // Expect ECONNREFUSED in initial booting.
                    )) {
                        if(socket) {await closeSocket(socket)} // close socket if exists
                        throw error
                    }
                    continue;
                }
            } while (!isLive);

            statusIsResolved = true;
            if(socket) {
                await closeSocket(socket);
            }
        })();

        const TIMEOUT_LENGTH = 30 * 1000;
        const timeout = new Promise((_, reject) => {
            setTimeout(() => {
                if (statusIsResolved) {
                    reject(new Error(`Startup check timeout after ${TIMEOUT_LENGTH}ms`));
                }
            }, TIMEOUT_LENGTH);
        })

        // Wait for server to go live:
        return Promise.race([
            serverIsLive,
            timeout,
        ])
        .then(x => {
            console.log('-- Server up. ', (new Date()).toISOString(),x)
            this.startPlayerCheck();
        })
        .catch(err => {
            console.error('Problem starting the minecraft server: ', err);
            this.serverProcess.kill();
            throw err;
        });
    }

    startProcess() {
        // Spin up minecraft server
        this.serverProcess = spawn('java', [
            /**          
                -server \
                -Xms${MCMINMEM} \
                -Xmx${MCMAXMEM} \
                -XX:+UseG1GC \
                -XX:+CMSClassUnloadingEnabled \
                -XX:ParallelGCThreads=2 \
                -XX:MinHeapFreeRatio=5 \
                -XX:MaxHeapFreeRatio=10 \
            */
            '-Xmx1024M', 
            '-Xms1024M', 
            '-jar', config.serverFile, 
            '--port', config.serverPort, 
            '--nogui'
        ], {
            cwd: config.serverDirectory,
            stdio: 'pipe'
        });

        this.serverProcess.on('close', (code, signal) => {
            this.serverProcess = null;
            console.log(`[DEBUG] Server process ended: ${JSON.stringify({code, signal})}`);
        });

        this.serverProcess.on('error', error => {
            console.error(`Error with Minecraft Server process: ${error}`);
        });
    }

    startPlayerCheck() {
        const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
        // const CHECK_INTERVAL = 10 * 1000; // 10 seconds
        this.playerCheckInterval = setInterval(this.checkForPlayers.bind(this), CHECK_INTERVAL);
    }
    
    async checkForPlayers() {
        console.log(`Check found ${await this.getPlayerCount()} players online`);
        if(await this.getPlayerCount() === 0) {
            if(this.lastCheckHadPlayers) {
                this.lastCheckHadPlayers = false;
            } else {
                // Wind down the server
                console.log('No users online; shutting down server');
                this.serverProcess.kill();
                clearInterval(this.playerCheckInterval);
            }
        } else {
            this.lastCheckHadPlayers = true;
        }
    }


    // API Calls
    async getPlayerCount() {
        const socket = await createSocket(this.serverPort, 'localhost');
        const serverStatus = await getServerStatus(socket);
        if (!(serverStatus && serverStatus.players)) {
            throw new Error(`Unexpected result from status check: ${JSON.stringify(serverStatus)}`)
        }
        return serverStatus.players.online;
    }
}


module.exports = new MinecraftServer();
