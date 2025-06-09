export class CommIn {
    static buffer;
    static idx;

    static init(buf) {
        this.buffer = new Uint8Array(buf);
        this.idx = 0;
    }

    static isMoreDataAvailable() {
        return Math.max(0, this.buffer.length - this.idx);
    }

    // Unsigned 8-bit integer (0 to 255)
    static unPackInt8U() {
        const i2 = this.idx;
        this.idx++;
        return this.buffer[i2];
    }

    // Signed 8-bit integer (-128 to 127)
    static unPackInt8() {
        const v = this.unPackInt8U();
        return (v + 128) % 256 - 128;
    }

    // Unsigned 16-bit integer (0 to 65535)
    static unPackInt16U() {
        const i2 = this.idx;
        this.idx += 2;
        return this.buffer[i2] + this.buffer[i2 + 1] * 256;
    }

    // Unsigned 24-bit integer (0 to 16777215)
    static unPackInt24U() {
        const i2 = this.idx;
        this.idx += 3;
        return this.buffer[i2] + this.buffer[i2 + 1] * 256 + this.buffer[i2 + 2] * 65536;
    }

    // Unsigned 32-bit integer (0 to 2^32-1)
    static unPackInt32U() {
        const i2 = this.idx;
        this.idx += 4;
        return this.buffer[i2] + this.buffer[i2 + 1] * 256 + this.buffer[i2 + 2] * 65536 + this.buffer[i2 + 3] * 16777216;
    }

    // Unsigned 8-bit integer (0 to 255)
    static unPackInt16() {
        const v = this.unPackInt16U();
        return (v + 32768) % 65536 - 32768;
    }

    // Unsigned 32-bit integer (-2^31 to 2^31-1)
    static unPackInt32() {
        const v = this.unPackInt32U();
        return (v + 2147483648) % 4294967296 - 2147483648;
    }

    // Unsigned radians (0 to 6.2831)
    static unPackRadU() {
        return this.unPackInt24U() / 2097152;
    }

    // Signed radians (-3.1416 to 3.1416)
    static unPackRad() {
        const v = this.unPackInt16U() / 8192;
        return v - Math.PI;
    }

    // Float value packing (-327.68 to 327.67)
    static unPackFloat() {
        return this.unPackInt16() / 256;
    }

    // Double value packing (-32768 to 32767)
    static unPackDouble() {
        return this.unPackInt32() / 1048576;
    }

    static unPackString(maxLen) {
        maxLen = maxLen || 255;
        const len = Math.min(this.unPackInt8U(), maxLen);
        return this.unPackStringHelper(len);
    }

    static unPackLongString(maxLen) {
        maxLen = maxLen || 16383;
        const len = Math.min(this.unPackInt16U(), maxLen);
        return this.unPackStringHelper(len);
    }

    static unPackStringHelper(len) {
        const remainder = this.isMoreDataAvailable();
        if (remainder < len) return 0;
        let str = '';
        for (let i2 = 0; i2 < len; i2++) {
            const c = this.unPackInt16U();
            if (c > 0) str += String.fromCodePoint(c);
        }
        return str;
    }
}

export default CommIn;