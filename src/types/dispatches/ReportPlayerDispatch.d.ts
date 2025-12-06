import Bot from '../bot';

export interface CheatingReasons {
    cheating?: boolean;
    harassment?: boolean;
    offensive?: boolean;
    other?: boolean;
}

export type Params = [idOrName: string, reasons?: CheatingReasons];

export class ReportPlayerDispatch {
    irOrName: string;
    reasons: boolean[];
    reasonInt: number;

    constructor(...args: Params);

    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default ReportPlayerDispatch;