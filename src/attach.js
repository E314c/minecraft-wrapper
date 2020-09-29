/**
 * This is used to attach to an existing STDIO socket from a running service
 */
const { connectToSocket } = require('./stdioSocket');
const { socketFile } = require('./config');

(async function () {
    // Check socket exists:
    const socket = await connectToSocket();
    console.log('Attached to socket at:', socketFile);
})()
