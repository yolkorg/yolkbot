export interface QueryRequest {
    cmd: string;
    [key: string]: any;
}

export interface QueryResponse {
    [key: string]: any;
}

export function queryServices(request: QueryRequest, proxy?: string, instance?: string): Promise<QueryResponse | string>;
export function loginWithCredentials(email: string, password: string, proxy?: string, instance?: string): Promise<QueryResponse | string>;
export function loginWithRefreshToken(refreshToken: string, proxy?: string, instance?: string): Promise<QueryResponse | string>;
export function loginAnonymously(proxy?: string, instance?: string): Promise<QueryResponse | string>;
export function createAccount(email: string, password: string, proxy?: string, instance?: string): Promise<QueryResponse | string>;