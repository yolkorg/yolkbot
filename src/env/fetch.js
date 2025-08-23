import dns from 'node:dns';
import net from 'node:net';
import tls from 'node:tls';

const parseProxyUrl = (proxyUrl) => {
    if (!proxyUrl) return null;
    const u = new URL(proxyUrl);
    return {
        host: u.hostname,
        port: parseInt(u.port),
        user: u.username,
        pass: u.password,
        remoteResolve: u.protocol === 'socks5h:'
    };
};

const sendHttpRequest = (socket, { method, pathname, destHost, destPort, headers, body }, resolve) => {
    let reqHeaders = '';
    for (const [k, v] of Object.entries(headers)) {
        reqHeaders += `${k}: ${v}\r\n`;
    }

    if (body && !('Content-Length' in headers)) {
        reqHeaders += `Content-Length: ${Buffer.byteLength(body)}\r\n`;
    }

    let req = `${method} ${pathname} HTTP/1.1\r\nHost: ${destHost}${destPort !== 80 && destPort !== 443 ? ':' + destPort : ''}\r\n${reqHeaders}Connection: close\r\n\r\n`;
    if (body) req += body;
    socket.write(req);

    let response = '';

    socket.on('data', (data) => {
        response += data.toString();

        if (/transfer-encoding:\s*chunked/i.test(response)) {
            if (response.includes('\r\n0\r\n\r\n')) socket.end();
        } else {
            const contentLengthMatch = response.match(/content-length:\s*(\d+)/i);
            if (contentLengthMatch) {
                const contentLength = parseInt(contentLengthMatch[1], 10);
                const bodyStart = response.indexOf('\r\n\r\n') + 4;
                const body3 = response.slice(bodyStart);
                if (body3.length >= contentLength) socket.end();
            }
        }
    });

    socket.on('end', () => {
        const isChunked = /transfer-encoding:\s*chunked/i.test(response);

        let parsedBody = response.split('\r\n\r\n')[1];
        if (isChunked) {
            const body2 = parsedBody;
            const chunks = [];
            let i = 0;
            while (i < body2.length) {
                const rnIdx = body2.indexOf('\r\n', i);
                if (rnIdx === -1) break;
                const sizeHex = body2.slice(i, rnIdx).trim();
                const size = parseInt(sizeHex, 16);
                if (size === 0) break;
                i = rnIdx + 2;
                chunks.push(body2.slice(i, i + size));
                i += size + 2;
            }
            parsedBody = chunks.join('');
        }

        resolve({ json: () => JSON.parse(parsedBody), text: () => parsedBody });
    });
};

const iFetch = (url, { method = 'GET', proxy, headers = {}, body = null } = {}) => new Promise((resolve, reject) => {
    const { hostname, port, pathname, protocol, search } = new URL(url);
    const isHttps = protocol === 'https:';
    const destPort = port ? parseInt(port) : (isHttps ? 443 : 80);
    const destHost = hostname;
    const fullPathname = pathname + search;
    const proxyInfo = parseProxyUrl(proxy);

    if (!proxyInfo) return dns.lookup(destHost, (err, address) => {
        if (err) throw err;
        const connectFn = isHttps ? tls.connect : net.connect;
        const socket = connectFn(destPort, address, isHttps ? { servername: destHost } : undefined, () => {
            sendHttpRequest(socket, { method, pathname: fullPathname, destHost, destPort, headers, body }, resolve);
        });
        socket.on('error', (e) => { throw e });
    });

    const { host: proxyHost, port: proxyPort, user, pass, remoteResolve } = proxyInfo;

    const connect = (ipOrHost) => {
        const socket = net.connect(proxyPort, proxyHost, () => {
            if (user && pass) socket.write(Buffer.from([0x05, 0x01, 0x02]));
            else socket.write(Buffer.from([0x05, 0x01, 0x00]));
        });

        const sendConnect = () => {
            let req;
            if (remoteResolve) {
                const hostBuf = Buffer.from(destHost);
                req = Buffer.concat([
                    Buffer.from([0x05, 0x01, 0x00, 0x03, hostBuf.length]),
                    hostBuf,
                    Buffer.from([(destPort >> 8) & 0xff, destPort & 0xff])
                ]);
            } else {
                const ipBuf = Buffer.from(ipOrHost.split('.').map(Number));
                req = Buffer.concat([
                    Buffer.from([0x05, 0x01, 0x00, 0x01]),
                    ipBuf,
                    Buffer.from([(destPort >> 8) & 0xff, destPort & 0xff])
                ]);
            }
            socket.write(req);
        };

        let stage = 0;
        socket.on('data', (data) => {
            if (stage === 0) {
                if (user && pass) {
                    if (data[1] !== 0x02) return reject('You tried to add authencation to a proxy that does not support username/password.');
                    const uBuf = Buffer.from(user);
                    const pBuf = Buffer.from(pass);
                    const authReq = Buffer.concat([
                        Buffer.from([0x01, uBuf.length]), uBuf,
                        Buffer.from([pBuf.length]), pBuf
                    ]);
                    socket.write(authReq);
                    stage = 0.5;
                } else {
                    if (data[1] !== 0x00) return reject('You tried to use a proxy that requires authentication. Add authentication to your proxy URL.');
                    stage = 1;
                    sendConnect();
                }
            } else if (stage === 0.5) {
                if (data[1] !== 0x00) return reject('Your input proxy username/password was incorrect.');
                stage = 1;
                sendConnect();
            } else if (stage === 1) {
                if (data[1] !== 0x00) return reject('SOCKS5 proxy connection failed :(');
                sendHttpRequest(socket, { method, pathname: fullPathname, destHost, headers, body }, resolve);
                stage = 2;
            }
        });

        socket.on('error', reject);
    };

    if (remoteResolve) connect();
    else dns.lookup(destHost, (err, address) => {
        if (err) return reject(err);
        connect(address);
    });
});

export default iFetch;