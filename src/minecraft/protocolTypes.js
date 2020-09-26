/**
 * 
 * @param {Buffer} buffer 
 */
function readVarInt(buffer){
    if(!(buffer instanceof Buffer)) {
        throw new TypeError('Please supply a buffer');
    }
    let val = 0;
    let len = 0
    let byte = 0;
    
    // Stack bytes where 8th bit is set
    do {
        byte = buffer.readUInt8(len);
        val |= (byte & 0x7F) << (7 * len);
        len++;
    } while ((byte & 0x80) != 0);

    return {
        val,
        len
    };
}

function writeVarInt(val) {
    let remainder = val;
    const buffer = Buffer.alloc(10);
    let len = 0;
    do {
        let byte = remainder & 0x7F;
        remainder = remainder >>> 7;
        if (remainder !== 0) {
            byte |= 0x80;
        }
        buffer.writeUInt8(byte, len);
        len++;
    } while (remainder !== 0)


    return buffer.slice(0,len);
}


function writeString(string) {
    const len = Buffer.byteLength(string,'utf-8');
    return Buffer.concat([
        writeVarInt(len),
        Buffer.from(string, 'utf-8')
    ]);
};

function readString(buffer) {
    const { val, len } = readVarInt(buffer);
    if(!(buffer instanceof Buffer)) {
        throw new TypeError('Must Read from Buffer');
    }
    return buffer.slice(len, len+val).toString('utf-8');
}

function writeUint16(val){
    const buf = Buffer.alloc(2);
    buf.writeUInt16BE(val);
    return buf;
}

module.exports = {
    readVarInt,
    writeVarInt,
    readString,
    writeString,
    writeUint16,
};
