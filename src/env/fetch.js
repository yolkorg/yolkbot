import { socksConnect } from 'wwws';

import globals from './globals.js';

const sendHttpRequest = (socket, { method, pathname, hostname, port, headers, body }, resolve) => {
    let reqHeaders = '';
    for (const [k, v] of Object.entries(headers)) reqHeaders += `${k}: ${v}\r\n`;

    if (body && !('Content-Length' in headers))
        reqHeaders += `Content-Length: ${Buffer.byteLength(body)}\r\n`;

    let req = `${method} ${pathname} HTTP/1.1\r\nHost: ${hostname}:${port}\r\n${reqHeaders}Connection: close\r\n\r\n`;
    if (body) req += body;
    socket.write(req);

    let response = '';

    socket.on('data', (data) => {
        response += data.toString();

        if (/transfer-encoding:\s*chunked/i.test(response)) {
            if (response.includes('\r\n0\r\n\r\n')) socket.end();
        } else {
            const contentLengthMatch = response.match(/content-length:\s*(?<len>\d+)/i);
            if (contentLengthMatch) {
                const contentLength = parseInt(contentLengthMatch.groups.len, 10);
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

const iFetch = (url, { method = 'GET', proxy, headers = {}, body = null } = {}) => new Promise((resolve) => {
    if (typeof process === 'undefined' || !process.getBuiltinModule) return globals.fetch(url, { method, headers, body }).then(resolve);

    const dns = process.getBuiltinModule('node:dns');
    const net = process.getBuiltinModule('node:net');
    const tls = process.getBuiltinModule('node:tls');

    const { hostname, port: rawPort, pathname: path, protocol, search } = new URL(url);
    const isHttps = protocol === 'https:';
    const pathname = path + search;
    const port = rawPort ? parseInt(rawPort) : (isHttps ? 443 : 80);

    if (!proxy) return dns.lookup(hostname, { family: 4 }, (err, host) => {
        if (err) throw err;

        const socket = isHttps ? tls.connect({ port, host, servername: hostname }) : net.connect({ port, host });

        socket.on('connect', () =>
            sendHttpRequest(socket, { method, pathname, hostname, port, headers, body }, resolve));
    });

    const proxyInfo = new URL(proxy);
    const scheme = proxyInfo.protocol.replace(':', '');
    if (scheme !== 'socks5' && scheme !== 'socks5h') throw new Error('iFetch only supports socks5 & socks5h proxies');

    socksConnect({
        proxy: {
            hostname: proxyInfo.hostname,
            port: Number(proxyInfo.port),
            username: proxyInfo.username,
            password: proxyInfo.password
        },
        destHost: hostname,
        destPort: port,
        useTLS: isHttps,
        resolveDnsLocally: proxyInfo.protocol === 'socks5'
    }).then((socket) => sendHttpRequest(socket, { method, pathname, hostname, port, headers, body }, resolve));
});

export default iFetch;