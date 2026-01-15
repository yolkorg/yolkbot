import { APIErrorEnum } from './enums';

export interface RawFirebase {
    kind: string;
    idToken: string;
    refreshToken: string;
    expiresIn: string; // in seconds
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
    errorLogger?: (...args: any[]) => void;
}

type ReturnError = { ok: false; error: APIErrorEnum };

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