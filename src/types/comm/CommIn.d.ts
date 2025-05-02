declare class CommIn {
    static buffer: Uint8Array;
    static idx: number;
    static init(buf: ArrayBuffer): void;
    static isMoreDataAvailable(): number;
    static peekInt8U(): number;
    static unPackInt8U(): number;
    static unPackInt8(): number;
    static unPackInt16U(): number;
    static unPackInt24U(): number;
    static unPackInt32U(): number;
    static unPackInt16(): number;
    static unPackInt32(): number;
    static unPackRadU(): number;
    static unPackRad(): number;
    static unPackFloat(): number;
    static unPackDouble(): number;
    static unPackString(maxLen?: number): string;
    static unPackLongString(maxLen?: number): string;
}

export default CommIn;