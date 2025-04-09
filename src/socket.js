import globals from './globals.js';
import { IsBrowser, UserAgent } from './constants/index.js';

class yolkws extends globals.WebSocket {
    constructor(url, proxy) {
        if (IsBrowser) super(url);
        else {
            super(url, {
                agent: proxy ? new globals.SocksProxyAgent(proxy) : undefined,
                headers: {
                    'user-agent': UserAgent,
                    'accept-language': 'en-US,en;q=0.9'
                }
            })
        }
    }
}

export default yolkws;