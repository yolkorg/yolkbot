export declare class CommOut {
    private idx: number;
    private arrayBuffer: ArrayBuffer;
    private buffer: Uint8Array;

    constructor(size: number);

    send(ws2: WebSocket): void;

    packInt8(val: number): void;
    packInt16(val: number): void;
    packInt24(val: number): void;
    packInt32(val: number): void;
    packRadU(val: number): void;
    packRad(val: number): void;
    packFloat(val: number): void;
    packDouble(val: number): void;

    packString(str: string): void;
    packLongString(str: string): void;
}

export default CommOut;