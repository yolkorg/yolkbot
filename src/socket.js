import NodeWebSocket from 'ws';

export const isBrowser = typeof window !== 'undefined';
// eslint-disable-next-line no-undef
export const WS = isBrowser ? window.WebSocket : NodeWebSocket;

let SocksProxyAgent;
if (!isBrowser) SocksProxyAgent = (await import('socks-proxy-agent')).SocksProxyAgent;

class yolkws extends WS {
    constructor(url, proxy, headers) {
        if (isBrowser) super(url);
        else {
            super(url, {
                agent: proxy ? new SocksProxyAgent(proxy) : undefined,
                headers
            })
        }
    }
}

export default yolkws;