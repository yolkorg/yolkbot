const decoder = new TextDecoder('utf-16le');

export class CommIn {
    static buffer: Uint8Array;
    static idx: number = 0;

    static init(buf: Uint8Array<ArrayBuffer>) {
        this.buffer = new Uint8Array(buf);
        this.idx = 0;
    }

    static isMoreDataAvailable(): boolean {
        return this.idx < this.buffer.length;
    }

    static getBytesLeft(): number {
        return this.buffer.length - this.idx;
    }

    static unPackInt8U(): number {
        return this.buffer[this.idx++];
    }

    static unPackInt8(): number {
        const v = this.unPackInt8U();
        return (v << 24) >> 24;
    }

    static unPackInt16U(): number {
        const i2 = this.idx;
        this.idx += 2;
        return this.buffer[i2] | (this.buffer[i2 + 1] << 8);
    }

    static unPackInt24U(): number {
        const i2 = this.idx;
        this.idx += 3;
        return this.buffer[i2] | (this.buffer[i2 + 1] << 8) | (this.buffer[i2 + 2] << 16);
    }

    static unPackInt32U(): number {
        const i2 = this.idx;
        this.idx += 4;
        return (this.buffer[i2] | (this.buffer[i2 + 1] << 8) | (this.buffer[i2 + 2] << 16) | (this.buffer[i2 + 3] << 24)) >>> 0;
    }

    static unPackInt16(): number {
        const v = this.unPackInt16U();
        return (v << 16) >> 16;
    }

    static unPackInt32(): number {
        const v = this.unPackInt32U();
        return v << 0;
    }

    static unPackRadU(): number {
        return this.unPackInt24U() / 2097152;
    }

    static unPackRad(): number {
        const v = this.unPackInt16U() / 8192;
        return v - Math.PI;
    }

    static unPackFloat(): number {
        return this.unPackInt16() / 256;
    }

    static unPackDouble(): number {
        return this.unPackInt32() / 1048576;
    }

    static unPackString(maxLen: number = 255): string {
        const len = Math.min(this.unPackInt8U(), maxLen);
        return this.unPackStringHelper(len);
    }

    static unPackLongString(maxLen: number = 16383): string {
        const len = Math.min(this.unPackInt16U(), maxLen);
        return this.unPackStringHelper(len);
    }

    static unPackStringHelper(len: number): string {
        if (this.getBytesLeft() < len * 2) return '';

        const startIdx = CommIn.idx;
        CommIn.idx += len * 2;

        return decoder.decode(CommIn.buffer.subarray(startIdx, CommIn.idx));
    }
}

export default CommIn;