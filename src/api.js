import globals from './globals.js';
import yolkws from './socket.js';

import { FirebaseKey, UserAgent } from './constants/index.js';

const queryServices = async (request, proxy = '', instance = 'shellshock.io') => {
    let ws;

    const attempt = async () => {
        try {
            ws = new yolkws(`wss://${instance}/services/`, proxy);
            ws.onerror = async (e) => {
                console.error(e);
                await new Promise((resolve) => setTimeout(resolve, 100));
                return await attempt();
            }
        } catch {
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
                // console.log('Full data received: ', mes);
                // console.log('Full error: ', e);

                resolve('bad_json');
            }

            ws.close();
        };

        ws.onerror = () => !resolved && resolve('unknown_socket_error');
        ws.onclose = () => !resolved && resolve('services_closed_early');
    });
}

async function createAccount(email, password, proxy = '', instance = 'shellshock.io') {
    return await loginWithCredentials(email, password, proxy, instance, true);
}

async function loginWithCredentials(email, password, proxy = '', instance = 'shellshock.io', _useRegisterEndpoint) {
    if (!email || !password) return 'firebase_no_credentials';

    /*
    Response looks something like:
        {
            id: <int>
            firebaseId: <string>
            sessionId: <string>
            session: <int>

            ... <irrelevant data>

            kills: <int>
            deaths: <int>
            currentBalance: <int>
        }
    */

    const endpoint = _useRegisterEndpoint ? 'signUp' : 'signInWithPassword';

    let SUCCESS = false;
    let request, body, token;
    let k = 0;

    while (!SUCCESS) {
        try {
            request = await globals.fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${endpoint}?key=${FirebaseKey}`, {
                method: 'POST',
                body: JSON.stringify({
                    email: email,
                    password: password,
                    returnSecureToken: true
                }),
                headers: {
                    'content-type': 'application/json',
                    'origin': 'https://shellshock.io',
                    'user-agent': UserAgent,
                    'x-client-version': 'Chrome/JsCore/9.17.2/FirebaseCore-web',
                    'x-firebase-locale': 'en'
                },
                dispatcher: proxy ? new globals.ProxyAgent(proxy.replace(/socks([4|5|4a|5h]+)/g, 'https')) : undefined
            });

            body = await request.json();
            token = body.idToken;
            SUCCESS = true;
        } catch (error) {
            ++k;
            if (error.code == 'auth/network-request-failed') {
                console.error('loginWithCredentials: Network req failed (auth/network-request-failed), retrying, k =', k);
            } else if (error.code == 'auth/missing-email') {
                return 'firebase_no_credentials';
            } else if (error.code == 'ERR_BAD_REQUEST') {
                console.error('loginWithCredentials: Error:', email, password);
                console.error('loginWithCredentials: Error:', error.response?.data || error, 'k =', k);
            } else {
                console.error('loginWithCredentials: Error:', email, password);
                console.error('loginWithCredentials: Error:', error, 'k =', k);
            }

            if (k > 5) return 'firebase_too_many_retries';
            else await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }

    if (!token) {
        console.error('loginWithCredentials: the game sent no idToken', body);
        return 'firebase_no_token';
    }

    const response = (await queryServices({
        cmd: 'auth',
        firebaseToken: token
    }, proxy, instance)).playerOutput;

    return response;
}

async function loginWithRefreshToken(refreshToken, proxy = '', instance = 'shellshock.io') {
    if (!refreshToken) return 'firebase_no_credentials';

    const formData = new URLSearchParams();
    formData.append('grant_type', 'refresh_token');
    formData.append('refresh_token', refreshToken);

    let SUCCESS = false;
    let request, body, token;
    let k = 0;

    while (!SUCCESS) {
        try {
            request = await globals.fetch(`https://securetoken.googleapis.com/v1/token?key=${FirebaseKey}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'origin': 'https://shellshock.io',
                    'user-agent': UserAgent,
                    'x-client-version': 'Chrome/JsCore/9.17.2/FirebaseCore-web',
                    'x-firebase-locale': 'en'
                },
                dispatcher: proxy ? new globals.ProxyAgent(proxy.replace(/socks([4|5|4a|5h]+)/g, 'https')) : undefined
            });

            body = await request.json();
            token = body.id_token;
            SUCCESS = true;
        } catch (error) {
            ++k;
            if (error.code == 'auth/network-request-failed') {
                console.error('loginWithRefreshToken: Network req failed (auth/network-request-failed), retrying, k =', k);
            } else if (error.code == 'auth/missing-email') {
                return 'firebase_no_credentials';
            } else {
                console.error('loginWithRefreshToken: Error:', refreshToken);
                console.error('loginWithRefreshToken: Error:', error, 'k =', k);
            }

            if (k > 5) return 'firebase_too_many_retries';
            else await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }

    if (!token) {
        console.error('loginWithRefreshToken: the game sent no idToken', body);
        return 'firebase_no_token';
    }

    const response = await queryServices({
        cmd: 'auth',
        firebaseToken: token
    }, proxy, instance);

    return response;
}

async function loginAnonymously(proxy = '', instance = 'shellshock.io') {
    const req = await globals.fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + FirebaseKey, {
        method: 'POST',
        body: JSON.stringify({
            returnSecureToken: true
        }),
        headers: {
            'content-type': 'application/json',
            'origin': 'https://shellshock.io',
            'user-agent': UserAgent,
            'x-client-version': 'Chrome/JsCore/9.17.2/FirebaseCore-web',
            'x-firebase-locale': 'en'
        },
        dispatcher: proxy ? new globals.ProxyAgent(proxy.replace(/socks([4|5|4a|5h]+)/g, 'https')) : undefined
    });

    const body = await req.json();
    const token = body.idToken;

    if (!token) {
        console.error('loginAnonymously: the game sent no idToken', body);
        return 'firebase_no_token';
    }

    const response = await queryServices({
        cmd: 'auth',
        firebaseToken: token
    }, proxy, instance);

    return response;
}

export {
    createAccount,
    loginAnonymously,
    loginWithCredentials,
    loginWithRefreshToken,
    queryServices
}