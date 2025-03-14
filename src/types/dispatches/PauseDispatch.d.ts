import Bot from '../bot';

export class PauseDispatch {
    check(bot: Bot): boolean;
    execute(bot: Bot): void;
}

export default PauseDispatch;