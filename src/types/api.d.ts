export interface QueryRequest {
    cmd: string;
    firebaseToken?: string;
}

export interface QueryResponse {
    id?: number;
    firebaseId?: string;
    sessionId?: string;
    session?: number;
    kills?: number;
    deaths?: number;
    currentBalance?: number;
    // theres more that we don't use and don't type
    [key: string]: any;
}

export function queryServices(request: QueryRequest, proxy?: string, instance?: string): Promise<QueryResponse | string>;
export function loginWithCredentials(email: string, password: string, prox?: string, instance?: string): Promise<QueryResponse | string>;
export function loginAnonymously(prox?: string, instance?: string): Promise<QueryResponse | string>;