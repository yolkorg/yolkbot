type Data = string | Buffer | ArrayBuffer | Buffer[];

interface yolkwsParams {
    proxy?: string;
    errorLogger?: (...args: any[]) => void;
}

declare class yolkws {
    connected: boolean;
    autoReconnect: boolean;

    url: string;
    proxy: string;

    binaryType: string;

    maxRetries: number;
    connectionTimeout: number;

    constructor(url: string, params: yolkwsParams);

    tryConnect($tries?: number): Promise<void>;

    onmessage: (data: Data) => void;
    onopen: () => void;
    onclose: (code: number, reason: string) => void;
    onerror: (err: Error) => void;

    send(data: Data): void;
    close(code?: number, reason?: string): void;
}

export default yolkws;