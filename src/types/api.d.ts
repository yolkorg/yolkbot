import { APIError } from './enums';

export interface RawFirebase {
    idToken: string;
    refeshToken: string;
    expiresIn: string;
    localId: string;
}

export interface QueryRequest {
    cmd: string;
    [key: string]: any;
}

export interface QueryResponse {
    ok: true;
    [key: string]: any;
}

export interface AuthResponse extends QueryResponse {
    firebase: RawFirebase;
}

export interface EmailResponse {
    ok: true;
    email: string;
}

interface APIParams {
    proxy?: string;
    protocol?: string;
    instance?: string;
    customKey?: string | null;
    connectionTimeout?: number;
}

type ReturnError = { ok: false; error: APIError };

type AnyObject = { [key: string]: any };

export class API {
    proxy?: string;
    protocol: string;
    instance: string;
    customKey?: string | null;
    connectionTimeout: number;

    constructor(params?: APIParams);

    queryServices(request: QueryRequest): Promise<QueryResponse | ReturnError>;

    createAccount(email: string, password: string, customServicesParams?: AnyObject): Promise<AuthResponse | ReturnError>;
    loginWithCredentials(email: string, password: string, customServicesParams?: AnyObject): Promise<AuthResponse | ReturnError>;
    loginWithRefreshToken(refreshToken: string, customServicesParams?: AnyObject): Promise<AuthResponse | ReturnError>;
    loginAnonymously(customServicesParams?: AnyObject): Promise<AuthResponse | ReturnError>;

    sendEmailVerification(idToken?: string): Promise<EmailResponse | ReturnError>;
    verifyOobCode(oobCode: string): Promise<EmailResponse | ReturnError>;
}