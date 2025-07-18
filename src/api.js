import globals from './globals.js';
import yolkws from './socket.js';

import { FirebaseKey, UserAgent } from './constants/index.js';

const baseHeaders = {
    'origin': 'https://shellshock.io',
    'user-agent': UserAgent,
    'x-client-version': 'Chrome/JsCore/9.17.2/FirebaseCore-web',
    'x-firebase-locale': 'en'
}

export class API {
    constructor(params = {}) {
        this.instance = params.instance || 'shellshock.io';
        this.protocol = params.protocol || 'wss';

        this.httpProxy = params.httpProxy || params.proxy?.replace(/socks([4|5|4a|5h]+):\/\//g, 'https://') || '';
        this.socksProxy = params.proxy;

        this.maxRetries = params.maxRetries || 5;
        this.suppressErrors = params.suppressErrors || false;
    }

    queryServices = async (request) => {
        const ws = new yolkws(`${this.protocol}://${this.instance}/services/`, this.socksProxy);
        const didConnect = await ws.tryConnect(-2);
        if (!didConnect) return 'websocket_connect_fail';

        return new Promise((resolve) => {
            let resolved = false;

            ws.onmessage = (mes) => {
                resolved = true;

                try {
                    const resp = JSON.parse(mes.data);
                    resolve(resp);
                } catch {
                    if (!this.suppressErrors) {
                        console.error('queryServices: Bad API JSON response with call: ' + request.cmd + ' and data:', JSON.stringify(request));
                        console.error('queryServices: Full data sent: ', JSON.stringify(request));
                    }

                    resolve('bad_json');
                }

                ws.close();
            };

            ws.onerror = () => !resolved && resolve('unknown_socket_error');
            ws.onclose = () => !resolved && resolve('services_closed_early');

            ws.send(JSON.stringify(request));
        });
    }

    #authWithEmailPass = async (email, password, endpoint) => {
        if (!email || !password) return 'firebase_no_credentials';

        let body, firebaseToken;

        try {
            const request = await globals.fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${endpoint}?key=${FirebaseKey}`, {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password,
                    returnSecureToken: true
                }),
                headers: {
                    ...baseHeaders,
                    'content-type': 'application/json'
                },
                dispatcher: this.httpProxy ? new globals.ProxyAgent(this.httpProxy) : undefined
            });

            body = await request.json();
            firebaseToken = body.idToken;
        } catch (error) {
            if (error.code === 'auth/network-request-failed') {
                if (!this.suppressErrors) console.error('loginWithCredentials: Network req failed (auth/network-request-failed)');
                return 'firebase_network_failed';
            } else if (error.code === 'auth/missing-email') {
                return 'firebase_no_credentials';
            } else if (error.code === 'ERR_BAD_REQUEST') {
                if (!this.suppressErrors) console.error('loginWithCredentials: Error:', email, password);
                if (!this.suppressErrors) console.error('loginWithCredentials: Error:', body || error);
                return 'firebase_bad_request';
            } else {
                if (!this.suppressErrors) console.error('loginWithCredentials: Error:', email, password, error);
                return 'firebase_unknown_error';
            }
        }

        if (!firebaseToken) {
            if (!this.suppressErrors) console.error('loginWithCredentials: the game sent no idToken', body);
            return 'firebase_no_token';
        }

        this.idToken = firebaseToken;

        const servicesQuery = await this.queryServices({ cmd: 'auth', firebaseToken });
        return typeof servicesQuery === 'object' ? { firebase: body, ...servicesQuery } : servicesQuery;
    }

    createAccount = async (email, password) =>
        await this.#authWithEmailPass(email, password, 'signUp');

    loginWithCredentials = async (email, password) =>
        await this.#authWithEmailPass(email, password, 'signInWithPassword');

    loginWithRefreshToken = async (refreshToken) => {
        if (!refreshToken) return 'firebase_no_credentials';

        const formData = new URLSearchParams();
        formData.append('grant_type', 'refresh_token');
        formData.append('refresh_token', refreshToken);

        let body, token;

        try {
            const request = await globals.fetch(`https://securetoken.googleapis.com/v1/token?key=${FirebaseKey}`, {
                method: 'POST',
                body: formData,
                headers: {
                    ...baseHeaders,
                    'content-type': 'application/x-www-form-urlencoded'
                },
                dispatcher: this.httpProxy ? new globals.ProxyAgent(this.httpProxy) : undefined
            });

            body = await request.json();
            token = body.id_token;
        } catch (error) {
            if (error.code === 'auth/network-request-failed') {
                if (!this.suppressErrors) console.error('loginWithRefreshToken: Network req failed (auth/network-request-failed)');
                return 'firebase_network_failed';
            } else if (error.code === 'auth/missing-email') {
                return 'firebase_no_credentials';
            } else {
                if (!this.suppressErrors) console.error('loginWithRefreshToken: Error:', error, refreshToken);
                return 'firebase_unknown_error';
            }
        }

        if (!token) {
            if (!this.suppressErrors) console.error('loginWithRefreshToken: the game sent no idToken', body);
            return 'firebase_no_token';
        }

        this.idToken = token;

        const response = await this.queryServices({ cmd: 'auth', firebaseToken: token });
        return typeof response === 'object' ? { firebase: body, ...response } : response;
    }

    loginAnonymously = async () => {
        const req = await globals.fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + FirebaseKey, {
            method: 'POST',
            body: JSON.stringify({ returnSecureToken: true }),
            headers: {
                ...baseHeaders,
                'content-type': 'application/json'
            },
            dispatcher: this.httpProxy ? new globals.ProxyAgent(this.httpProxy) : undefined
        });

        const body = await req.json();
        const firebaseToken = body.idToken;

        if (!firebaseToken) {
            if (!this.suppressErrors) console.error('loginAnonymously: the game sent no idToken', body);
            return 'firebase_no_token';
        }

        this.idToken = firebaseToken;

        const query = await this.queryServices({ cmd: 'auth', firebaseToken });
        return typeof query === 'object' ? { firebase: body, ...query } : query;
    }

    sendEmailVerification = async (idToken = this.idToken) => {
        if (!idToken) return 'no_idtoken_passed';

        const req = await globals.fetch('https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=' + FirebaseKey, {
            method: 'POST',
            body: JSON.stringify({
                requestType: 'VERIFY_EMAIL',
                idToken
            }),
            headers: {
                ...baseHeaders,
                'content-type': 'application/json'
            },
            dispatcher: this.httpProxy ? new globals.ProxyAgent(this.httpProxy) : undefined
        });

        const body = await req.json();

        if (body.kind !== 'identitytoolkit#GetOobConfirmationCodeResponse') {
            if (!this.suppressErrors) console.error('sendEmailVerification: the game sent an invalid response', body);
            return 'firebase_invalid_response';
        }

        return { email: body.email };
    }

    verifyOobCode = async (oobCode) => {
        if (!oobCode) return 'no_oob_code_passed';

        const req = await globals.fetch('https://www.googleapis.com/identitytoolkit/v3/relyingparty/setAccountInfo?key=' + FirebaseKey, {
            method: 'POST',
            body: JSON.stringify({ oobCode }),
            headers: {
                ...baseHeaders,
                'x-client-version': 'Chrome/JsCore/3.7.5/FirebaseCore-web',
                'referer': 'https://shellshockio-181719.firebaseapp.com/',
                'content-type': 'application/json'
            },
            dispatcher: this.httpProxy ? new globals.ProxyAgent(this.httpProxy) : undefined
        });

        const body = await req.json();

        if (!body.emailVerified) {
            if (!this.suppressErrors) console.error('verifyOobCode: the game sent an invalid response', body);
            return 'firebase_invalid_response';
        }

        return body.email;
    }
}

export default API;