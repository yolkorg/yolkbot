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
    onmessage: (event: MessageEvent) => void;
    onclose: (event: CloseEvent) => void;
    onerror: (event: Event) => void;

    send(data: Data): void;
    close(data?: number): void;
}

export default yolkws;