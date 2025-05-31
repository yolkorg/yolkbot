import Bot from '../bot';

export class SwitchTeamDispatch {
    validate(bot: Bot): boolean;
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default SwitchTeamDispatch;