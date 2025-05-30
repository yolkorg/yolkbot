import Bot from '../bot';

export interface CheatingReasons {
    cheating?: boolean;
    harassment?: boolean;
    offensive?: boolean;
    other?: boolean;
}

export class ReportPlayerDispatch {
    irOrName: string;
    reasons: boolean[];
    reasonInt: number;

    constructor(idOrName: string, reasons?: CheatingReasons);

    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default ReportPlayerDispatch;