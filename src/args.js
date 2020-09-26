module.exports = require('yargs')
    .option('minecraftDirectory', {
        alias: 'm',
        description: 'the folder to run minecraft from',
        default: process.cwd()
    })
    .option('minecraftFile', {
        alias: 'f',
        description: 'the filename for the minecraft server jar (without path)',
        default: 'server.jar'
    })
    .option('port', {
        alias: 'p',
        description: 'The port to expose for clients to connect to',
        // default: 25565
        default: 25569
    })
    .option('detach', {
        alias: 'd',
        description: 'Detach the process to run after this process (and/or it\'s parent) exits.',
        type: 'boolean'
    })
    .help()
    .argv;
