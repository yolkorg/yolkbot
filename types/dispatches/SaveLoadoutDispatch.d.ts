import Bot from '../bot';

export interface Changes {
    classIdx?: number;
    hatId?: number;
    stampId?: number;
    grenadeId?: number;
    meleeId?: number;
    colorIdx?: number;
    primaryId?: number[];
    secondaryId?: number[];
}

export interface LoadoutOptions {
    gunId?: number;
    hatId?: number;
    stampId?: number;
    grenadeId?: number;
    meleeId?: number;
    eggColor?: number;
    primaryIds?: number[];
    secondaryIds?: number[];
}

export type Params = [loadoutOptions: LoadoutOptions];

export class SaveLoadoutDispatch {
    changes: Changes;

    constructor(...args: Params);

    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default SaveLoadoutDispatch;