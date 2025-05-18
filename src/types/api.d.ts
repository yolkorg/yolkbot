export interface QueryRequest {
    cmd: string;
    [key: string]: any;
}

export interface QueryResponse {
    [key: string]: any;
}

interface APIParams {
    instance?: string;
    protocol?: string;
    httpProxy?: string;
    socksProxy?: string;
    maxRetries?: number;
}

export class API {
    instance: string;
    protocol: string;

    httpProxy: string;
    socksProxy: string;

    maxRetries: number;

    constructor(params?: APIParams);

    queryServices(request: QueryRequest): Promise<QueryResponse | string>;

    loginWithCredentials(email: string, password: string): Promise<QueryResponse | string>;
    loginWithRefreshToken(refreshToken: string): Promise<QueryResponse | string>;
    loginAnonymously(): Promise<QueryResponse | string>;
    createAccount(email: string, password: string): Promise<QueryResponse | string>;
}