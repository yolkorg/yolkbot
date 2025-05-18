import { API } from './api';
import { GameModes } from './constants/index';
import yolkws from './socket';

type MatchmakerParams = {
    instance?: string;
    protocol?: string;
    proxy?: string;
    sessionId?: string;
    noLogin?: boolean;
    api?: API;
};

type Region = {
    id: string;
    name: string;
};

type FindGameParams = {
    region: string;
    mode: keyof typeof GameModes;
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

    api: API;

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