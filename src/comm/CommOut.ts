interface SatisifiableWebSocket {
    send: (data: Uint8Array) => void;
}

export class CommOut {
    idx: number = 0;
    arrayBuffer: ArrayBuffer;
    view: DataView;

    constructor(size = 16384) {
        this.idx = 0;
        this.arrayBuffer = new ArrayBuffer(size);
        this.view = new DataView(this.arrayBuffer);
    }

    send(ws2: SatisifiableWebSocket): void {
        const b2 = new Uint8Array(this.arrayBuffer, 0, this.idx);
        ws2.send(b2);
    }

    packInt8(val: number): void {
        this.view.setInt8(this.idx, val);
        this.idx++;
    }

    packInt16(val: number): void {
        this.view.setInt16(this.idx, val, true);
        this.idx += 2;
    }

    packInt24(val: number): void {
        this.view.setInt16(this.idx, val & 0xFFFF, true);
        this.view.setInt8(this.idx + 2, (val >> 16) & 0xFF);
        this.idx += 3;
    }

    packInt32(val: number): void {
        this.view.setInt32(this.idx, val, true);
        this.idx += 4;
    }

    packRadU(val: number): void {
        this.packInt24(val * 2097152);
    }

    packRad(val: number): void {
        this.packInt16((val + Math.PI) * 8192);
    }

    packFloat(val: number): void {
        this.packInt16(val * 256);
    }

    packDouble(val: number): void {
        this.packInt32(val * 1048576);
    }

    packString(str: string): void {
        if (typeof str !== 'string') str = '';
        if (str.length > 255) {
            console.trace('truncated packString to fit int8 (shell protocol); this should not happen (report it on GitHub)')
            str = str.slice(0, 255);
        }
        this.packInt8(str.length);
        for (let i = 0; i < str.length; i++) this.packInt16(str.charCodeAt(i));
    }

    packLongString(str: string): void {
        if (typeof str !== 'string') str = '';
        this.packInt16(str.length);
        for (let i = 0; i < str.length; i++) this.packInt16(str.charCodeAt(i));
    }
}

export default CommOut;