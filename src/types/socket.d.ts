import NodeWebSocket from 'ws';

declare class yolkws extends NodeWebSocket {
    constructor(url: string, proxy: string);
}

export default yolkws;