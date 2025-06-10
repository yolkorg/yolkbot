import globals from './globals.js';
import { IsBrowser, UserAgent } from './constants/index.js';

const generateWebSocketKey = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
}

class yolkws extends globals.WebSocket {
    constructor(url, proxy) {
        if (IsBrowser) super(url);
        else {
            super(url, {
                agent: proxy ? new globals.SocksProxyAgent(proxy) : undefined,
                headers: {
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'accept-language': 'en-US,en;q=0.9',
                    'cache-control': 'no-cache',
                    'connection': 'Upgrade',
                    'host': url.split('/')[2],
                    'origin': url.split('/')[0] + '//' + url.split('/')[2],
                    'pragma': 'no-cache',
                    'sec-websocket-extensions': 'permessage-deflate; client_max_window_bits',
                    'sec-websocket-key': generateWebSocketKey(),
                    'sec-websocket-version': '13',
                    'upgrade': 'websocket',
                    'user-agent': UserAgent
                }
            })
        }
    }
}

export default yolkws;