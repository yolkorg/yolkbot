import Bot from '../bot';

type CheatingReasons = {
    cheating?: boolean;
    harassment?: boolean;
    offensive?: boolean;
    other?: boolean;
}

export class ReportPlayerDispatch {
    id?: number;
    name?: string;
    reasons: boolean[];
    reasonInt: number;

    constructor(idOrName: number | string, reasons?: CheatingReasons);

    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default ReportPlayerDispatch;