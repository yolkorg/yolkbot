import yolkws from './socket.js';

import { FirebaseKey, UserAgent } from '#constants';

const queryServices = async (request, proxy = '', instance = 'shellshock.io') => {
    return new Promise((resolve) => {
        const ws = new yolkws(`wss://${instance}/services/`, proxy);

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

async function loginWithCredentials(email, password, prox = '', instance = 'shellshock.io') {
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

    let SUCCESS = false;
    let request, body, token;
    let k = 0;

    while (!SUCCESS) {
        try {
            request = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + FirebaseKey, {
                method: 'POST',
                body: JSON.stringify({
                    email: email,
                    password: password,
                    returnSecureToken: true
                }),
                headers: {
                    'user-agent': UserAgent,
                    'x-client-version': 'Chrome/JsCore/9.17.2/FirebaseCore-web'
                }
            })
            body = await request.json();
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

            await new Promise((resolve) => setTimeout(resolve, 100));
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

async function loginAnonymously(prox = '', instance = 'shellshock.io') {
    const request = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + FirebaseKey, {
        method: 'POST',
        body: JSON.stringify({ returnSecureToken: true }),
        headers: {
            'user-agent': UserAgent,
            'x-client-version': 'Chrome/JsCore/9.17.2/FirebaseCore-web'
        }
    })

    const body = await request.json();
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
    loginAnonymously,
    loginWithCredentials,
    queryServices
}