export declare type API = import('./api.js').API;
export declare type Bot = import('./bot.js').Bot;
export declare const Enums: typeof import('./enums.js');
export declare const yolkws: typeof import('./socket.js').default;
export declare const util: typeof import('./util.js');

export declare type GamePlayer = import('./bot/GamePlayer.js').GamePlayer;

export declare const Comm: {
    CommIn: typeof import('./comm/CommIn.js').CommIn;
    CommOut: typeof import('./comm/CommOut.js').CommOut;
};

export declare const Constants: typeof import('./constants/index.js');
export declare const Challenges: typeof import('./constants/challenges.js').Challenges;
export declare const CloseCode: typeof import('./constants/CloseCode.js').CloseCode;
export declare const CommCode: typeof import('./constants/CommCode.js').CommCode;
export declare const Guns: typeof import('./constants/guns.js');
export declare const Items: typeof import('./constants/items.js').Items;
export declare const Maps: typeof import('./constants/maps.js').Maps;
export declare const Regions: typeof import('./constants/regions.js').Regions;

export declare const Dispatches: typeof import('./dispatches/index.js').default;

export declare const iFetch: typeof import('./env/fetch.js').default;
export declare const globals: typeof import('./env/globals.js').globals;

export declare const WASM: typeof import('./wasm/direct.js');

declare const _default: typeof import('./bot.js').Bot;
export default _default;