import globals from './env/globals.js';
import yolkws from './socket.js';

import { APIError } from './enums.js';
import { createError } from './util.js';

import { FirebaseKey, UserAgent } from './constants/index.js';

const baseHeaders = {
    'origin': 'https://shellshock.io',
    'user-agent': typeof process === 'undefined' ? null : UserAgent,
    'x-client-version': 'Chrome/JsCore/9.17.2/FirebaseCore-web',
    'x-firebase-locale': 'en'
}

export class API {
    errorLogger = (...args) => console.error(...args);

    constructor(params = {}) {
        this.proxy = params.proxy;
        this.instance = params.instance || 'shellshock.io';
        this.protocol = params.protocol || 'wss';
        this.customKey = params.customKey || null;

        this.connectionTimeout = params.connectionTimeout || 5000;

        if (typeof params.errorLogger === 'function') this.errorLogger = params.errorLogger;
    }

    queryServices = async (request) => {
        const ws = new yolkws(`${this.protocol}://${this.instance}/services/`, { proxy: this.proxy, errorLogger: this.errorLogger });
        ws.connectionTimeout = this.connectionTimeout;

        const didConnect = await ws.tryConnect();
        if (!didConnect || ws.socket.readyState !== 1) return createError(APIError.WebSocketConnectFail);

        return new Promise((resolve) => {
            let resolved = false;

            ws.onmessage = (mes) => {
                resolved = true;

                try {
                    const resp = JSON.parse(mes.data);
                    resolve({ ok: true, ...resp });
                } catch (e) {
                    this.errorLogger('queryServices: error! command:', request.cmd, 'and data:', request, e);
                    resolve(createError(APIError.InternalError));
                }

                ws.close();
            };

            ws.onerror = (error) => {
                if (resolved) return;
                resolved = true;

                this.errorLogger('queryServices: websocket error! command:', request.cmd, 'and data:', request, 'error:', error);

                resolve(createError(APIError.InternalError));
            };

            ws.onclose = () => {
                if (resolved) return;
                resolved = true;

                this.errorLogger('queryServices: services closed before sending back message');
                this.errorLogger('queryServices: command:', request.cmd, 'and data:', request);

                resolve(createError(APIError.ServicesClosedEarly));
            };

            ws.send(JSON.stringify(request));
        });
    }

    #authWithEmailPass = async (email, password, customServicesParams, endpoint) => {
        if (!email || !password) return createError(APIError.MissingParams);

        let body;

        try {
            const request = await globals.fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${endpoint}?key=${this.customKey || FirebaseKey}`, {
                method: 'POST',
                body: JSON.stringify({ email, password, returnSecureToken: true }),
                headers: {
                    ...baseHeaders,
                    'content-type': 'application/json'
                },
                proxy: this.proxy
            });

            body = await request.json();
        } catch (error) {
            if (error.code === 'auth/too-many-requests') return createError(APIError.FirebaseRateLimited);
            else if (error.code === 'auth/network-request-failed') {
                this.errorLogger('authWithEmailPass: network error', body || error);
                return createError(APIError.NetworkFail);
            } else if (error.code === 'ERR_BAD_REQUEST') {
                this.errorLogger('authWithEmailPass: bad request', body || error);
                return createError(APIError.InternalError);
            } else if (error.code === 'ECONNREFUSED') {
                this.errorLogger('authWithEmailPass: connection refused', body || error);
                return createError(APIError.NetworkFail);
            }

            this.errorLogger('authWithEmailPass: unknown error:', email, error);
            return createError(APIError.InternalError);
        }

        if (!body.idToken) {
            this.errorLogger('authWithEmailPass: missing idToken', body);
            return createError(APIError.InternalError);
        }

        this.idToken = body.idToken;

        const servicesQuery = await this.queryServices({ cmd: 'auth', firebaseToken: body.idToken, ...customServicesParams });
        return servicesQuery.ok ? { firebase: body, ...servicesQuery } : servicesQuery;
    }

    createAccount = (email, password, customServicesParams) => this.#authWithEmailPass(email, password, customServicesParams, 'signUp');
    loginWithCredentials = (email, password, customServicesParams) => this.#authWithEmailPass(email, password, customServicesParams, 'signInWithPassword');

    loginWithRefreshToken = async (refreshToken, customServicesParams) => {
        if (!refreshToken) return createError(APIError.MissingParams);

        const formData = new URLSearchParams();
        formData.append('grant_type', 'refresh_token');
        formData.append('refresh_token', refreshToken);

        let body;

        try {
            const request = await globals.fetch(`https://securetoken.googleapis.com/v1/token?key=${this.customKey || FirebaseKey}`, {
                method: 'POST',
                body: formData.toString(),
                headers: {
                    ...baseHeaders,
                    'content-type': 'application/x-www-form-urlencoded'
                },
                proxy: this.proxy
            });

            body = await request.json();
        } catch (error) {
            if (error.code === 'auth/too-many-requests') return createError(APIError.FirebaseRateLimited);
            else if (error.code === 'auth/network-request-failed') {
                this.errorLogger('loginWithRefreshToken: network error', body || error);
                return createError(APIError.NetworkFail);
            } else if (error.code === 'ECONNREFUSED') {
                this.errorLogger('loginWithRefreshToken: connection refused', body || error);
                return createError(APIError.NetworkFail);
            }

            this.errorLogger('loginWithRefreshToken: unknown error:', body, error);
            return createError(APIError.InternalError);
        }

        if (!body.id_token) {
            this.errorLogger('loginWithRefreshToken: missing idToken', body);
            return createError(APIError.InternalError);
        }

        this.idToken = body.id_token;

        const response = await this.queryServices({ cmd: 'auth', firebaseToken: body.id_token, ...customServicesParams });
        return response.ok ? { firebase: body, ...response } : response;
    }

    loginAnonymously = async (customServicesParams) => {
        let body;

        try {
            const req = await globals.fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.customKey || FirebaseKey}`, {
                method: 'POST',
                body: JSON.stringify({ returnSecureToken: true }),
                headers: {
                    ...baseHeaders,
                    'content-type': 'application/json'
                },
                proxy: this.proxy
            });

            body = await req.json();
        } catch (error) {
            if (error.code === 'auth/too-many-requests') return createError(APIError.FirebaseRateLimited);
            else if (error.code === 'ECONNREFUSED') {
                this.errorLogger('loginAnonymously: connection refused', body || error);
                return createError(APIError.NetworkFail);
            }

            this.errorLogger('loginAnonymously: unknown error:', body, error);
            return createError(APIError.InternalError);
        }

        if (!body.idToken) {
            this.errorLogger('loginAnonymously: missing idToken', body);
            return createError(APIError.InternalError);
        }

        this.idToken = body.idToken;

        const query = await this.queryServices({ cmd: 'auth', firebaseToken: body.idToken, ...customServicesParams });
        return query.ok ? { firebase: body, ...query } : query;
    }

    sendEmailVerification = async (idToken = this.idToken) => {
        if (!idToken) return createError(APIError.MissingParams);

        let body;

        try {
            const req = await globals.fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${this.customKey || FirebaseKey}`, {
                method: 'POST',
                body: JSON.stringify({ requestType: 'VERIFY_EMAIL', idToken }),
                headers: {
                    ...baseHeaders,
                    'content-type': 'application/json'
                },
                proxy: this.proxy
            });

            body = await req.json();
        } catch (error) {
            if (error.code === 'auth/too-many-requests') return createError(APIError.FirebaseRateLimited);
            else if (error.code === 'auth/network-request-failed') {
                this.errorLogger('sendEmailVerification: network error', body || error);
                return createError(APIError.NetworkFail);
            } else if (error.code === 'ECONNREFUSED') {
                this.errorLogger('sendEmailVerification: connection refused', body || error);
                return createError(APIError.NetworkFail);
            }

            this.errorLogger('sendEmailVerification: unknown error:', idToken, error);
            return createError(APIError.InternalError);
        }

        if (body.kind !== 'identitytoolkit#GetOobConfirmationCodeResponse') {
            this.errorLogger('sendEmailVerification: the game sent an invalid response', body);
            return createError(APIError.InternalError);
        }

        return { ok: true, email: body.email };
    }

    verifyOobCode = async (oobCode) => {
        if (!oobCode) return createError(APIError.MissingParams);

        let body;

        try {
            const req = await globals.fetch(`https://www.googleapis.com/identitytoolkit/v3/relyingparty/setAccountInfo?key=${this.customKey || FirebaseKey}`, {
                method: 'POST',
                body: JSON.stringify({ oobCode }),
                headers: {
                    ...baseHeaders,
                    'x-client-version': 'Chrome/JsCore/3.7.5/FirebaseCore-web',
                    'referer': 'https://shellshockio-181719.firebaseapp.com/',
                    'content-type': 'application/json'
                },
                proxy: this.proxy
            });

            body = await req.json();
        } catch (error) {
            if (error.code === 'auth/too-many-requests') return createError(APIError.FirebaseRateLimited);
            else if (error.code === 'auth/network-request-failed') {
                this.errorLogger('verifyOobCode: network error', body || error);
                return createError(APIError.NetworkFail);
            } else if (error.code === 'ECONNREFUSED') {
                this.errorLogger('verifyOobCode: connection refused', body || error);
                return createError(APIError.NetworkFail);
            }

            this.errorLogger('verifyOobCode: unknown error:', oobCode, error);
            return createError(APIError.InternalError);
        }

        if (!body.emailVerified) {
            this.errorLogger('verifyOobCode: the game sent an invalid response', body);
            return createError(APIError.InternalError);
        }

        return { ok: true, email: body.email };
    }
}

export default API;