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

export declare class GameOptionsDispatch {
    constructor(changes: GameOptionChanges);
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default GameOptionsDispatch;