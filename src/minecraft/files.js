// This file will help interact with minecraft files, for configuration and settings.

const fs = require('fs');
const path=require('path');

function readConfig(directory) {
    const data = fs.readFileSync(path.resolve(directory, './minecraft.properties'), 'utf8');

    const lines = data.split('\n');
    const config = lines.reduce((acc, line) => {
        const [key, ...val] = line.split('=');
        acc[key]= val.join('=');
        return acc;
    }, {});

    return config;
}

function writeConfig(dir) {

} 


function findMinecraftFile(dir) {
    
}


module.exports = {
    findMinecraftFile
};
