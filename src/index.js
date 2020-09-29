// Note: some dependencies must be required at runtime to avoid config lockdown.
const { spawn } = require('child_process');
const args = require('./args');

// Check config is vaild (expected files and folders exist)


// -- Main -- //
(async function main () {
    process.on("uncaughtException", (error) => {
        console.error('Uncaught exception seen:\n', error);
    });
    
    try {

        if(args.detach) {
            // Spawn the detached process and exit:
            const nonDetachArgs = process.argv.slice(1).filter(x => x !== '-d' && x !== '--detach');
            console.log('Spawning process into background:');
            const subprocess = spawn('node', nonDetachArgs, {
                detached: true
            });
            subprocess.stdout.pipe(process.stdout);
            console.log(`Started process ${subprocess.pid}`);

            // Don't do anything else
            return;
        }
        // TODO: Split function to either connect into existing socket, or startup server

        // TODO: Make sure the minecraft server is fully configured
        // Start up the proxy server
        const createTcpProxy = require('./tcpProxy');
        await createTcpProxy();

        // If auto start requested, start spinning up the minecraft server
        if(args["autostart-server"]) {
            const MinecraftServer = require('./minecraft/server');
            await MinecraftServer.start();
        };
    } catch (e) {
        console.error('Fatal Error in main:\n', e);
        process.exit(1);
    }
})().catch(mainError => {
    console.error('Error in main:', mainError);
})
