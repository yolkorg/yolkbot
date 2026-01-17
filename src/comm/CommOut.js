export class CommOut {
    constructor(size = 16384) {
        this.idx = 0;
        this.arrayBuffer = new ArrayBuffer(size);
        this.view = new DataView(this.arrayBuffer);
        this.buffer = new Uint8Array(this.arrayBuffer);
    }

    send(ws2) {
        const b2 = new Uint8Array(this.arrayBuffer, 0, this.idx);
        ws2.send(b2);
    }

    packInt8(val) {
        this.view.setInt8(this.idx, val);
        this.idx++;
    }

    packInt16(val) {
        this.view.setInt16(this.idx, val, true);
        this.idx += 2;
    }

    packInt24(val) {
        this.view.setInt16(this.idx, val & 0xFFFF, true);
        this.view.setInt8(this.idx + 2, (val >> 16) & 0xFF);
        this.idx += 3;
    }

    packInt32(val) {
        this.view.setInt32(this.idx, val, true);
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

    packString(str) {
        if (typeof str !== 'string') str = '';
        if (str.length > 255) {
            console.trace('truncated packString to fit int8 (shell protocol); this should not happen (report it on GitHub)')
            str = str.slice(0, 255);
        }
        this.packInt8(str.length);
        for (let i = 0; i < str.length; i++) this.packInt16(str.charCodeAt(i));
    }

    packLongString(str) {
        if (typeof str !== 'string') str = '';
        this.packInt16(str.length);
        for (let i = 0; i < str.length; i++) this.packInt16(str.charCodeAt(i));
    }
}

export default CommOut;