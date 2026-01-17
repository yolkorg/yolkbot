type Data = string | Buffer | ArrayBuffer | Buffer[];

interface yolkwsParams {
    proxy?: string;
    errorLogger?: (...args: any[]) => void;
}

declare class yolkws {
    connected: boolean;
    autoReconnect: boolean;

    url: string;
    proxy: string | undefined;

    binaryType: string;

    connectionTimeout: number;

    constructor(url: string, params?: yolkwsParams);

    tryConnect($tries?: number): Promise<boolean>;

    onopen: () => void;
    onmessage: (data: MessageEvent) => void;
    onclose: (code: CloseEvent) => void;
    onerror: (err: Event) => void;

    send(data: Data): void;
    close(code?: number, reason?: string): void;
}

export default yolkws;