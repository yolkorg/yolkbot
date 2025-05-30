const gravityScale = Array.from({ length: 4 }, (_, i) => (i + 1) * 0.25);
const damageScale = Array.from({ length: 9 }, (_, i) => i * 0.25);
const regenScale = Array.from({ length: 17 }, (_, i) => i * 0.25);

export class GameOptionsDispatch {
    constructor(changes) {
        this.changes = changes;
    }

    #constructFinalOutput(bot) {
        const output = {};

        output.gravity = this.changes.gravity || bot.game.options.gravity;
        output.damage = this.changes.damage || bot.game.options.damage;
        output.healthRegen = this.changes.healthRegen || bot.game.options.healthRegen;
        output.locked = this.changes.locked !== undefined ? this.changes.locked : bot.game.options.locked;
        output.noTeamChange = this.changes.noTeamChange !== undefined ? this.changes.noTeamChange : bot.game.options.noTeamChange;
        output.noTeamShuffle = this.changes.noTeamShuffle !== undefined ? this.changes.noTeamShuffle : bot.game.options.noTeamShuffle;

        output.weaponsDisabled = [
            typeof this.changes.disableEggk !== 'undefined' ? this.changes.disableEggk : bot.game.options.weaponsDisabled[0],
            typeof this.changes.disableScrambler !== 'undefined' ? this.changes.disableScrambler : bot.game.options.weaponsDisabled[1],
            typeof this.changes.disableFreeRanger !== 'undefined' ? this.changes.disableFreeRanger : bot.game.options.weaponsDisabled[2],
            typeof this.changes.disableRPG !== 'undefined' ? this.changes.disableRPG : bot.game.options.weaponsDisabled[3],
            typeof this.changes.disableWhipper !== 'undefined' ? this.changes.disableWhipper : bot.game.options.weaponsDisabled[4],
            typeof this.changes.disableCrackshot !== 'undefined' ? this.changes.disableCrackshot : bot.game.options.weaponsDisabled[5],
            typeof this.changes.disableTriHard !== 'undefined' ? this.changes.disableTriHard : bot.game.options.weaponsDisabled[6]
        ];

        if (this.changes.toDisable && Array.isArray(this.changes.toDisable)) this.changes.toDisable.forEach((idx) => output.weaponsDisabled[idx] = true);
        if (this.changes.toEnable && Array.isArray(this.changes.toEnable)) this.changes.toEnable.forEach((idx) => output.weaponsDisabled[idx] = false);

        if (this.changes.rawWeaponsDisabled && Array.isArray(this.changes.rawWeaponsDisabled) && this.changes.rawWeaponsDisabled.length === 7)
            output.weaponsDisabled = this.changes.rawWeaponsDisabled.map((v) => !!v);

        output.mustUseSecondary = output.weaponsDisabled.every((v) => v);

        return output;
    }

    validate(bot) {
        const wouldBe = this.#constructFinalOutput(bot);

        if (!gravityScale.includes(wouldBe.gravity)) return false;
        if (!damageScale.includes(wouldBe.damage)) return false;
        if (!regenScale.includes(wouldBe.healthRegen)) return false;

        if (typeof wouldBe.locked !== 'boolean') return false;
        if (typeof wouldBe.noTeamChange !== 'boolean') return false;
        if (typeof wouldBe.noTeamShuffle !== 'boolean') return false;

        if (!Array.isArray(wouldBe.weaponsDisabled)) return false;
        if (wouldBe.weaponsDisabled.length !== 7) return false;
        if (wouldBe.weaponsDisabled.some((weapon) => typeof weapon !== 'boolean')) return false;

        return true;
    }

    check(bot) {
        return bot.game.isGameOwner;
    }

    execute(bot) {
        bot.game.options = this.#constructFinalOutput(bot);
        bot.updateGameOptions();
    }
}

export default GameOptionsDispatch;