const { expect } = require('chai');

const { 
    writeVarInt, 
    readVarInt,
    writeString,
    readString,
} = require('./protocolTypes');

describe('Minecraft::VarInt', () => {

    const tests = [{
        num: 0x10,
        buff: 0x10
    }, {
        num: 0xFF,
        buff: 0xFF01     // 8th bit is moved into next byte, which is 
    }, {
        num: 0x1080,
        buff: 0x8021
    // }, { // Maybe I'll check how it handles this later if needed
    //     num: -1,
    //     buff: 0xFFFFFFFFF7
    }, {
        num: 0x1FFFFF,
        buff: 0xFFFF7F
    }];

    describe('writeVarInt', () => {
        it('creates expected buffers', () => {
            tests.forEach(test => {
                expect(writeVarInt(test.num).toString('hex')).to.equal(test.buff.toString(16))
            })
        });
    });

    describe('readVarInt', () => {
        it('can read buffers into values', () => {
            tests.forEach(test => {
                const buffString = test.buff.toString(16);
                const buffer = Buffer.from(buffString, 'hex');
                const res = readVarInt(buffer);
                try {

                    expect(res.val).to.equal(test.num);
                    expect(res.len).to.equal(Math.ceil(buffString.length/2));
                } catch (e) {
                    const wrappedError = new Error(`Error in test case ${test.buff.toString(16)}->${test.num.toString(16)}:\n\t${e.message}`);
                    wrappedError.stack = e.stack;
                    throw wrappedError;

                }
            });
        });
    });

    describe('writeString', () => {
        it('Writes the expected string buffer', () => {
            const test = 'this is a string';
            const len = test.length;
    
            const res = writeString(test);
    
            const hex = res.toString('hex');
    
            expect(hex).to.equal(`${writeVarInt(len).toString('hex')}${Buffer.from(test,'utf-8').toString('hex')}`)

        });

    });
});
