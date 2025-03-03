import NodeWebSocket from 'ws';

export const isBrowser = typeof window !== 'undefined';
// eslint-disable-next-line no-undef
export const WS = isBrowser ? window.WebSocket : NodeWebSocket;

let SocksProxyAgent;
if (!isBrowser) SocksProxyAgent = (await import('socks-proxy-agent')).SocksProxyAgent;

import { UserAgent } from '#constants';

class yolkws extends WS {
    constructor(url, proxy) {
        if (isBrowser) super(url);
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