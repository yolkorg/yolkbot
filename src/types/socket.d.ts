type Data = string | Buffer | ArrayBuffer | Buffer[];

declare class yolkws {
    constructor(url: string, proxy: string);

    tryConnect($tries?: number): Promise<void>;

    onmessage: (data: Data) => void;
    onopen: () => void;
    onclose: (code: number, reason: string) => void;
    onerror: (err: Error) => void;

    send(data: Data): void;
    close(code?: number, reason?: string): void;
}

export default yolkws;