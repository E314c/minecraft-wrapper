const os = require('os');
const path = require('path');
const args = require('./args');
const frozenKeys = new Set();

// Initialise with args
const defaultConfig = {
    proxyPort: args.port,
    serverDirectory: args.minecraftDirectory,
    serverFile: args.minecraftFile,
    serverPort: 25565,
    serverStdioConnectedToThisStdio: false, // TODO: Take from arg
    serverIdleTimeout: Math.round(args.timeout * 60 * 1000), // convert minutes to milliseconds

    // Need this to be deterministic between processes, so that the attach works properly
    // socketFile: path.resolve(args.minecraftDirectory, './minecraftStdio.sock'),
    socketFile: os.platform() === 'win32' ? '\\\\?\\pipe\\minecraftStdio.sock' : path.resolve(os.tmpdir(), './minecraftStdio.sock')
};

const configObject = new Proxy(defaultConfig, {
    set: (obj, prop, value) => {
        if (frozenKeys.has(prop)) {
            throw new TypeError(`Config property ${prop} has already been accessed and so cannot be modified`);
        }
        obj[prop] = value;
    },
    get: (obj, prop) => {
        frozenKeys.add(prop);
        return obj[prop];
    }
});





// Set config


module.exports = configObject;
