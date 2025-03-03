import yolkws from './socket.js';

import { UserAgent } from '#constants';

const firebaseKey = 'AIzaSyDP4SIjKaw6A4c-zvfYxICpbEjn1rRnN50';

async function queryServices(request, proxy = '') {
    const ws = new yolkws('wss://shellshock.io/services/', proxy);

    const openPromise = new Promise((resolve, reject) => {
        ws.addEventListener('open', () => resolve(ws));
        ws.onerror = (err) => reject(err);
    });

    const connectedWs = await openPromise;

    const sendPromise = connectedWs.send(JSON.stringify(request));
    await sendPromise;

    const response = await new Promise((resolve, reject) => {
        ws.onmessage = (mes) => {
            try {
                const resp = JSON.parse(mes.data);
                resolve(resp);
            } catch (e) {
                console.log('Bad API JSON response in queryServices with call: ' + request.cmd + ' and data: ' + JSON.stringify(request));
                console.log('Full data sent: ', JSON.stringify(request));
                console.log('Full data received: ', mes);
                console.log('Full error: ', e);

                resolve({ error: 'Bad JSON' });
            }

            ws.close();
        };
        ws.onerror = reject;

    });

    if (response.error) {
        console.log('queryServices error:', response.error);
        return null;
    }

    return response;
}

async function loginWithCredentials(email, password, prox = '') {
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
            request = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + firebaseKey, {
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
                console.error('loginWithCredentials: You did not specify an email when using loginWithCredentials');
                process.exit(0);
            } else {
                console.error('loginWithCredentials: Error:', email, password);
                console.error('loginWithCredentials: Error:', error, 'k =', k);
            }
        }
    }

    const response = await queryServices({
        cmd: 'auth',
        firebaseToken: token
    }, prox);

    return response;
}

async function loginAnonymously(prox = '') {
    const request = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + firebaseKey, {
        method: 'POST',
        body: JSON.stringify({ returnSecureToken: true }),
        headers: {
            'user-agent': UserAgent,
            'x-client-version': 'Chrome/JsCore/9.17.2/FirebaseCore-web'
        }
    })

    const body = await request.json();
    const token = body.idToken;

    const response = await queryServices({
        cmd: 'auth',
        firebaseToken: token
    }, prox);

    return response
}

export {
    loginAnonymously,
    loginWithCredentials,
    queryServices
}