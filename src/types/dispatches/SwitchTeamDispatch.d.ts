import Bot from '../bot';

export class SwitchTeamDispatch {
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default SwitchTeamDispatch;