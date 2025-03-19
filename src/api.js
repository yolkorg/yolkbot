import axios from 'axios';

import yolkws from './socket.js';

import { FirebaseKey, IsBrowser, UserAgent } from '#constants';

let SocksProxyAgent;
if (!IsBrowser) SocksProxyAgent = (await import('smallsocks')).SocksProxyAgent;

const queryServices = async (request, proxy = '', instance = 'shellshock.io') => {
    let ws;

    const attempt = async () => {
        try {
            ws = new yolkws(`wss://${instance}/services/`, proxy);
        } catch {
            await new Promise((resolve) => setTimeout(resolve, 100));
            await attempt();
        }
    }

    await attempt();

    return new Promise((resolve) => {
        ws.onopen = () => {
            // console.log('opened')
            ws.send(JSON.stringify(request));
        }

        let resolved = false;

        ws.onmessage = (mes) => {
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

            resolved = true;
            ws.close();
        };

        ws.onerror = () => !resolved && resolve('unknown_socket_error');
        ws.onclose = () => !resolved && resolve('services_closed_early');
    });
}

async function createAccount(email, password, prox = '', instance = 'shellshock.io') {
    return await loginWithCredentials(email, password, prox, instance, true);
}

async function loginWithCredentials(email, password, prox = '', instance = 'shellshock.io', _useRegisterEndpoint) {
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
            request = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:${endpoint}?key=${FirebaseKey}`, {
                email: email,
                password: password,
                returnSecureToken: true
            }, {
                headers: {
                    'user-agent': UserAgent,
                    'x-client-version': 'Chrome/JsCore/9.17.2/FirebaseCore-web'
                },
                httpsAgent: (!IsBrowser && prox) ? new SocksProxyAgent(prox) : false
            })
            body = request.data
            token = body.idToken;
            SUCCESS = true;
        } catch (error) {
            ++k;
            if (error.code == 'auth/network-request-failed') {
                console.error('loginWithCredentials: Network req failed (auth/network-request-failed), retrying, k =', k);
            } else if (error.code == 'auth/missing-email') {
                return 'firebase_no_credentials';
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

    const response = await queryServices({
        cmd: 'auth',
        firebaseToken: token
    }, prox, instance);

    return response;
}

async function loginWithRefreshToken(refreshToken, prox = '', instance = 'shellshock.io') {
    if (!refreshToken) return 'firebase_no_credentials';

    const formData = new URLSearchParams();
    formData.append('grant_type', 'refresh_token');
    formData.append('refresh_token', refreshToken);

    let SUCCESS = false;
    let request, body, token;
    let k = 0;

    while (!SUCCESS) {
        try {
            request = await axios.post(`https://securetoken.googleapis.com/v1/token?key=${FirebaseKey}`, formData, {
                headers: {
                    'user-agent': UserAgent,
                    'x-client-version': 'Chrome/JsCore/9.17.2/FirebaseCore-web'
                },
                httpsAgent: (!IsBrowser && prox) ? new SocksProxyAgent(prox) : false
            })
            body = request.data
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
    }, prox, instance);

    return response;
}

async function loginAnonymously(prox = '', instance = 'shellshock.io') {
    const { data: body } = await axios.post('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + FirebaseKey, {
        returnSecureToken: true
    }, {
        headers: {
            'user-agent': UserAgent,
            'x-client-version': 'Chrome/JsCore/9.17.2/FirebaseCore-web'
        },
        httpsAgent: (!IsBrowser && prox) ? new SocksProxyAgent(prox) : false
    });

    const token = body.idToken;

    if (!token) {
        console.error('loginAnonymously: the game sent no idToken', body);
        return 'firebase_no_token';
    }

    const response = await queryServices({
        cmd: 'auth',
        firebaseToken: token
    }, prox, instance);

    return response;
}

export {
    createAccount,
    loginAnonymously,
    loginWithCredentials,
    loginWithRefreshToken,
    queryServices
}