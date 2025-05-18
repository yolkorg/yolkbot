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

        this.httpProxy = params.httpProxy || params.proxy?.replace(/socks([4|5|4a|5h]+):\/\//g, 'https') || '';
        this.socksProxy = params.proxy;

        this.maxRetries = params.maxRetries || 5;
    }

    queryServices = async (request) => {
        let ws;
        let tries = 0;

        const attempt = async () => {
            try {
                ws = new yolkws(`${protocol}://${instance}/services/`, this.socksProxy);
                ws.onerror = async (e) => {
                    tries++;
                    console.error(e);
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    return await attempt();
                }
            } catch {
                if (tries > this.maxRetries) return 'max_retries_exceeded';
                await new Promise((resolve) => setTimeout(resolve, 100));
                await attempt();
            }
        }

        await attempt();

        return new Promise((resolve) => {
            ws.onopen = () => {
                ws.onerror = null;
                ws.send(JSON.stringify(request));
            }

            let resolved = false;

            ws.onmessage = (mes) => {
                resolved = true;

                try {
                    const resp = JSON.parse(mes.data);
                    resolve(resp);
                } catch {
                    console.error('queryServices: Bad API JSON response with call: ' + request.cmd + ' and data:', JSON.stringify(request));
                    console.error('queryServices: Full data sent: ', JSON.stringify(request));

                    resolve('bad_json');
                }

                ws.close();
            };

            ws.onerror = () => !resolved && resolve('unknown_socket_error');
            ws.onclose = () => !resolved && resolve('services_closed_early');
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
                console.error('loginWithCredentials: Network req failed (auth/network-request-failed)');
                return 'firebase_network_failed';
            } else if (error.code === 'auth/missing-email') {
                return 'firebase_no_credentials';
            } else if (error.code === 'ERR_BAD_REQUEST') {
                console.error('loginWithCredentials: Error:', email, password);
                console.error('loginWithCredentials: Error:', error.response?.data || error);
                return 'firebase_bad_request';
            } else {
                console.error('loginWithCredentials: Error:', email, password);
                return 'firebase_unknown_error';
            }
        }

        if (firebaseToken) return await this.queryServices({ cmd: 'auth', firebaseToken });
        else {
            console.error('loginWithCredentials: the game sent no idToken', body);
            return 'firebase_no_token';
        }
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
                console.error('loginWithRefreshToken: Network req failed (auth/network-request-failed)');
                return 'firebase_network_failed';
            } else if (error.code === 'auth/missing-email') {
                return 'firebase_no_credentials';
            } else {
                console.error('loginWithRefreshToken: Error:', error, refreshToken);
                return 'firebase_unknown_error';
            }
        }

        if (!token) {
            console.error('loginWithRefreshToken: the game sent no idToken', body);
            return 'firebase_no_token';
        }

        const response = await this.queryServices({ cmd: 'auth', firebaseToken: token });
        return response;
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

        if (firebaseToken) return await this.queryServices({ cmd: 'auth', firebaseToken });
        else {
            console.error('loginAnonymously: the game sent no idToken', body);
            return 'firebase_no_token';
        }
    }
}

export default API;