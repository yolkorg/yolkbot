import { API } from './api';
import { Region } from './constants/regions';
import yolkws from './socket';

interface MatchmakerParams {
    api?: API;
    proxy?: string;
    instance?: string;
    protocol?: string;
    noLogin?: boolean;
    sessionId?: string;
    noExitOnError?: boolean;
    connectionTimeout?: number;
};

export interface MatchmakerCommand {
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

    regionList: Region[];
    ws: yolkws;

    constructor(params?: MatchmakerParams);

    send(msg: MatchmakerCommand): void;

    getRegions(): Promise<Region[]>;

    waitForConnect(): Promise<void>;
    close(): void;

    on(event: string, callback: Function): void;
    once(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
}

export default Matchmaker;
