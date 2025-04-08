import NodeWebSocket from 'ws';

import { IsBrowser, ProxiesEnabled, UserAgent } from './constants/index.js';

const WS = IsBrowser ? window.WebSocket : NodeWebSocket;

let SocksProxyAgent;
if (ProxiesEnabled) SocksProxyAgent = (await import('smallsocks')).SocksProxyAgent;

class yolkws extends WS {
    constructor(url, proxy) {
        if (IsBrowser) super(url);
        else {
            super(url, {
                agent: proxy ? new SocksProxyAgent(proxy) : undefined,
                headers: {
                    'user-agent': UserAgent,
                    'accept-language': 'en-US,en;q=0.9'
                }
            })
        }
    }
}

export default yolkws;