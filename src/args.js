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
        default: 25569
    })
    .option('detach', {
        alias: 'd',
        description: 'Detach the process to run after this process (and/or it\'s parent) exits.',
        type: 'boolean'
    })
    .option('timeout', {
        alias: 't',
        description: 'How often the server should check for an empty server. It will shut down when 2 checks find no people. (minutes)',
        default: 5
    })
    .option('attach-minecraft-terminal', {
        description: `attaches the stdio from the minecraft server to this process's stdio.`,
        type: 'boolean'
    })
    .help()
    .argv;
