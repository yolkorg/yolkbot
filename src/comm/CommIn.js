export class CommIn {
    static buffer;
    static idx;

    static init(buf) {
        this.buffer = new Uint8Array(buf);
        this.idx = 0;
    }

    static isMoreDataAvailable() {
        return this.buffer.length - this.idx;
    }

    static unPackInt8U() {
        return this.buffer[this.idx++];
    }

    static unPackInt8() {
        const v = this.unPackInt8U();
        return (v << 24) >> 24;
    }

    static unPackInt16U() {
        const i2 = this.idx;
        this.idx += 2;
        return this.buffer[i2] | (this.buffer[i2 + 1] << 8);
    }

    static unPackInt24U() {
        const i2 = this.idx;
        this.idx += 3;
        return this.buffer[i2] | (this.buffer[i2 + 1] << 8) | (this.buffer[i2 + 2] << 16);
    }

    static unPackInt32U() {
        const i2 = this.idx;
        this.idx += 4;
        return (this.buffer[i2] | (this.buffer[i2 + 1] << 8) | (this.buffer[i2 + 2] << 16) | (this.buffer[i2 + 3] << 24)) >>> 0;
    }

    static unPackInt16() {
        const v = this.unPackInt16U();
        return (v << 16) >> 16;
    }

    static unPackInt32() {
        const v = this.unPackInt32U();
        return v << 0;
    }

    static unPackRadU() {
        return this.unPackInt24U() / 2097152;
    }

    static unPackRad() {
        const v = this.unPackInt16U() / 8192;
        return v - Math.PI;
    }

    static unPackFloat() {
        return this.unPackInt16() / 256;
    }

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
        if (this.isMoreDataAvailable() < len * 2) return '';
        const chars = [];
        for (let i = 0; i < len; i++) {
            const c = this.unPackInt16U();
            if (c > 0) chars.push(String.fromCodePoint(c));
        }
        return chars.join('');
    }
}

export default CommIn;