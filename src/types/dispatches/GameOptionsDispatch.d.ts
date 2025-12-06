import Bot from '../bot';

export interface GameOptionChanges {
    gravity?: number;
    damage?: number;
    healthRegen?: number;
    locked?: boolean;
    noTeamChange?: boolean;
    noTeamShuffle?: boolean;
    disableEggk?: boolean;
    disableScrambler?: boolean;
    disableFreeRanger?: boolean;
    disableRPG?: boolean;
    disableWhipper?: boolean;
    disableCrackshot?: boolean;
    disableTriHard?: boolean;
    toDisable?: number[];
    toEnable?: number[];
    rawWeaponsDisabled?: boolean[];
}

export type Params = [changes: GameOptionChanges];

export declare class GameOptionsDispatch {
    changes: GameOptionChanges;

    constructor(...args: Params);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default GameOptionsDispatch;