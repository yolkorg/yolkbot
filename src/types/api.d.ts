export interface QueryRequest {
    cmd: string;
    [key: string]: any;
}

export interface QueryResponse {
    [key: string]: any;
}

interface APIParams {
    proxy?: string;
    protocol?: string;
    instance?: string;
    maxRetries?: number;
    suppressErrors?: boolean;
    connectionTimeout?: number;
}

export type QueryServicesError = 'websocket_connect_fail' | 'bad_json' | 'unknown_socket_error' | 'services_closed_early';
export type AnonError = 'firebase_network_failed' | 'firebase_no_token';
export type LoginError = AnonLogin | 'firebase_no_credentials' | 'firebase_bad_request' | 'firebase_unknown_error';
export type EmailVerifyError = 'no_idtoken_passed' | 'firebase_invalid_response';
export type OobCodeError = 'no_oob_code_passed' | 'firebase_unknown_error';

export class API {
    proxy?: string;
    protocol: string;
    instance: string;
    maxRetries: number;
    suppressErrors: boolean;
    connectionTimeout: number;

    constructor(params?: APIParams);

    queryServices(request: QueryRequest): Promise<QueryResponse | QueryServicesError>;

    loginWithCredentials(email: string, password: string): Promise<QueryResponse | LoginError>;
    loginWithRefreshToken(refreshToken: string): Promise<QueryResponse | LoginError>;
    loginAnonymously(): Promise<QueryResponse | AnonError>;
    createAccount(email: string, password: string): Promise<QueryResponse | LoginError>;
    sendEmailVerification(idToken?: string): Promise<{ email: string } | EmailVerifyError>;
    verifyOobCode(oobCode: string): Promise<QueryResponse | OobCodeError>;
}