/**
 * This is used to attach to an existing STDIO socket from a running service
 */
const fs = require('fs/promises');
const config = require('./config');
const { connectToSocket } = require('./stdioSocket');

(async function () {
    // Check socket exists:
    connectToSocket();
})()