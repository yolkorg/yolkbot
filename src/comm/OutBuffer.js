import CommOut from './CommOut.js';

class OutBuffer {
    constructor(size) {
        this.idx = 0;
        this.arrayBuffer = new ArrayBuffer(size);
        this.buffer = new Uint8Array(this.arrayBuffer, 0, size);
    }
    send(ws2) {
        const b2 = new Uint8Array(this.arrayBuffer, 0, this.idx);
        ws2.send(b2);
        CommOut.bufferPool.recycle(this);
    }
    packInt8(val) {
        this.buffer[this.idx] = val & 255;
        this.idx++;
    }
    packInt16(val) {
        this.buffer[this.idx] = val & 255;
        this.buffer[this.idx + 1] = val >> 8 & 255;
        this.idx += 2;
    }
    packInt24(val) {
        this.buffer[this.idx] = val & 255;
        this.buffer[this.idx + 1] = val >> 8 & 255;
        this.buffer[this.idx + 2] = val >> 16 & 255;
        this.idx += 3;
    }
    packInt32(val) {
        this.buffer[this.idx] = val & 255;
        this.buffer[this.idx + 1] = val >> 8 & 255;
        this.buffer[this.idx + 2] = val >> 16 & 255;
        this.buffer[this.idx + 3] = val >> 24 & 255;
        this.idx += 4;
    }
    packRadU(val) {
        this.packInt24(val * 2097152);
    }
    packRad(val) {
        this.packInt16((val + Math.PI) * 8192);
    }
    packFloat(val) {
        this.packInt16(val * 256);
    }
    packDouble(val) {
        this.packInt32(val * 1048576);
    }
    packString(str, doMalicious = false) {
        if (typeof str !== 'string') str = '';
        this.packInt8(doMalicious ? 254 : str.length);
        for (let i2 = 0; i2 < str.length; i2++) this.packInt16(str.charCodeAt(i2));
    }
    packLongString(str) {
        if (typeof str !== 'string') str = '';
        this.packInt16(str.length);
        for (let i2 = 0; i2 < str.length; i2++) this.packInt16(str.charCodeAt(i2));
    }
}

export default OutBuffer;