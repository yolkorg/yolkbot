type Data = string | Buffer | ArrayBuffer | Buffer[];

declare class yolkws {
    connected: boolean;
    autoReconnect: boolean;

    url: string;
    proxy: string;

    binaryType: string;

    maxRetries: number;
    connectionTimeout: number;

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