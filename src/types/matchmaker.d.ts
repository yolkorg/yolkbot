import { GameModes, PlayTypes } from './constants/index.js';
import yolkws from './socket.js';

type MatchmakerParams = {
    instance?: string;
    protocol?: string;
    proxy?: string;
    sessionId?: string;
    noLogin?: boolean;
};

type Region = {
    id: string;
    name: string;
};

type FindGameParams = {
    region: string;
    mode: keyof typeof GameModes;
};

type RegionListResponse = {
    command: 'regionList';
    regionList: Region[];
};

export interface RawGameData {
    command: 'gameFound';
    region: string;
    subdomain: string;
    id: string;
    uuid: string;
    private: boolean;
    noobLobby: boolean;
}

type CommandSend = {
    command: string;
    [key: string]: any;
}

export declare class Matchmaker {
    connected: boolean;
    onceConnected: Function[];

    proxy: string | null;
    sessionId: string;
    onListeners: Map<string, Function[]>;
    onceListeners: Map<string, Function[]>;

    regionList: Region[] | null;
    ws: yolkws;

    constructor(params?: MatchmakerParams);

    send(msg: CommandSend): void;

    getRegions(): Promise<Region[]>;
    findPublicGame(params: FindGameParams): Promise<RawGameData>;

    getRandomRegion(): string;
    getRandomGameMode(): keyof typeof GameModes;

    waitForConnect(): Promise<void>;
    close(): void;

    on(event: string, callback: Function): void;
    once(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
}

export default Matchmaker;