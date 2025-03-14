import Bot from '../bot';

type Changes = {
    classIdx?: number;
    hatId?: number;
    stampId?: number;
    grenadeId?: number;
    meleeId?: number;
    colorIdx?: number;
    primaryId?: number[];
    secondaryId?: number[];
}

type Opts = {
    gunId?: number;
    hatId?: number;
    stampId?: number;
    grenadeId?: number;
    meleeId?: number;
    eggColor?: number;
    primaryIds?: number[];
    secondaryIds?: number[];
}

export class SaveLoadoutDispatch {
    changes: Changes;

    constructor(opts: Opts);

    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default SaveLoadoutDispatch;