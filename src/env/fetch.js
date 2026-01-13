import { socksConnect } from 'wwws';

import globals from './globals.js';

const parseChunkedBody = (body) => {
    const chunks = [];
    let i = 0;
    const len = body.length;

    while (i < len) {
        const rnIdx = body.indexOf('\r\n', i);
        if (rnIdx === -1) break;

        const sizeHex = body.slice(i, rnIdx).trim();
        if (!sizeHex) {
            i = rnIdx + 2;
            continue;
        }

        const size = parseInt(sizeHex, 16);
        if (size === 0) break;

        i = rnIdx + 2;
        chunks.push(body.slice(i, i + size));
        i += size + 2;
    }

    return chunks.join('');
};

const sendHttpRequest = (socket, { method, pathname, hostname, port, headers, body }, time, resolve, reject) => {
    const timeout = setTimeout(() => {
        socket.destroy();
        reject(new Error('iFetch timed out to', `${method} ${hostname}:${port}${pathname}`));
    }, time);

    let reqHeaders = Object.entries(headers).map(([k, v]) => `${k}: ${v}\r\n`).join('');
    if (body && !('Content-Length' in headers)) reqHeaders += `Content-Length: ${Buffer.byteLength(body)}\r\n`;

    socket.write(`${method} ${pathname} HTTP/1.1\r\nHost: ${hostname}:${port}\r\n${reqHeaders}Connection: close\r\n\r\n`);
    if (body) socket.write(body);

    let response = '';
    let headersParsed = false;
    let contentLength = 0;
    let bodyStart = 0;

    socket.on('data', (data) => {
        response += data.toString();

        if (!headersParsed) {
            bodyStart = response.indexOf('\r\n\r\n');
            if (bodyStart !== -1) {
                headersParsed = true;
                bodyStart += 4;
                const headersText = response.slice(0, bodyStart - 4);
                const contentLengthMatch = headersText.match(/content-length:\s*(?<length>\d+)/i);
                if (contentLengthMatch) contentLength = parseInt(contentLengthMatch.groups.length, 10);
            }
        }

        if (headersParsed) {
            const isChunked = /transfer-encoding:\s*chunked/i.test(response);
            if (isChunked) {
                if (response.includes('\r\n0\r\n\r\n')) socket.end();
            } else if (contentLength > 0) {
                const bodyReceived = response.length - bodyStart;
                if (bodyReceived >= contentLength) socket.end();
            }
        }
    });

    socket.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
    });

    socket.on('end', () => {
        clearTimeout(timeout);

        const headerEnd = response.indexOf('\r\n\r\n');
        if (headerEnd === -1) return reject(new Error('Invalid HTTP response'));

        let parsedBody = response.slice(headerEnd + 4);
        if (/transfer-encoding:\s*chunked/i.test(response)) parsedBody = parseChunkedBody(parsedBody);

        resolve({
            json: () => JSON.parse(parsedBody),
            text: () => parsedBody
        });
    });
};

const iFetch = (url, { method = 'GET', proxy, headers = {}, body = null, timeout = 30000 } = {}) => new Promise((resolve, reject) => {
    try {
        if (typeof process === 'undefined' || !process.getBuiltinModule)
            return globals.fetch(url, { method, headers, body }).then(resolve).catch(reject);

        const dns = process.getBuiltinModule('node:dns');
        const net = process.getBuiltinModule('node:net');
        const tls = process.getBuiltinModule('node:tls');

        const { hostname, port: rawPort, pathname: path, protocol, search } = new URL(url);
        const isHttps = protocol === 'https:';
        const pathname = path + search;
        const port = rawPort ? parseInt(rawPort, 10) : (isHttps ? 443 : 80);

        if (!proxy) {
            return dns.lookup(hostname, (err, host) => {
                if (err) return reject(err);

                const socket = isHttps ? tls.connect({ port, host, servername: hostname }) : net.connect({ port, host });
                socket.on('connect', () => sendHttpRequest(socket, { method, pathname, hostname, port, headers, body }, timeout, resolve, reject));
            });
        }

        const proxyInfo = new URL(proxy);
        const scheme = proxyInfo.protocol.replace(':', '');
        if (scheme !== 'socks5' && scheme !== 'socks5h')
            return reject(new Error('iFetch only supports socks5 & socks5h proxies'));

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
        }).then((socket) =>
            sendHttpRequest(socket, { method, pathname, hostname, port, headers, body }, timeout, resolve, reject)
        ).catch(reject);
    } catch (err) {
        reject(err);
    }
});

export default iFetch;