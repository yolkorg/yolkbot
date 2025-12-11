import CommIn from '../comm/CommIn.js';
import { FramesBetweenSyncs, GameMode, Movement } from '../constants/index.js';

const processSyncThemPacket = (bot) => {
    const id = CommIn.unPackInt8U();
    const x = CommIn.unPackFloat();
    const y = CommIn.unPackFloat();
    const z = CommIn.unPackFloat();
    const climbing = CommIn.unPackInt8U();

    const player = bot.players[id];
    if (!player || player.id === bot.me.id) {
        for (let i2 = 0; i2 < FramesBetweenSyncs; i2++) {
            CommIn.unPackInt8U();
            CommIn.unPackRadU();
            CommIn.unPackRad();
            CommIn.unPackInt8U();
        }
        return; // syncMe has a job
    }

    for (let i2 = 0; i2 < FramesBetweenSyncs; i2++) {
        const controlKeys = CommIn.unPackInt8U();

        if (controlKeys & Movement.Jump) player.jumping = true;
        else player.jumping = false;

        if (controlKeys & Movement.Scope) player.scoping = true;
        else player.scoping = false;

        const oldView = structuredClone(player.view);

        player.view.yaw = CommIn.unPackRadU();
        player.view.pitch = CommIn.unPackRad();

        if (player.view.yaw !== oldView.yaw || player.view.pitch !== oldView.pitch)
            bot.$emit('playerRotate', player, oldView, player.view);

        player.scale = CommIn.unPackInt8U();
    }

    const px = player.position;
    const posChanged = px.x !== x || px.y !== y || px.z !== z;
    const climbingChanged = player.climbing !== climbing;
    const didChange = posChanged || climbingChanged;

    const oldPosition = didChange ? structuredClone(px) : null;

    if (px.x !== x) px.x = x;
    if (px.z !== z) px.z = z;
    if (!player.jumping || Math.abs(px.y - y) > 0.5) px.y = y;
    if (climbingChanged) player.climbing = climbing;

    if (!didChange) return;

    bot.$emit('playerMove', player, oldPosition, px);

    if (bot.game.gameModeId !== GameMode.KOTC) return;

    const zone = bot.game.kotc.activeZone;
    const wasIn = !!player.inKotcZone;

    if (!zone && wasIn) {
        player.inKotcZone = false;
        bot.$emit('playerLeaveZone', player, ZoneLeaveReason.RoundEnded);
        return;
    }

    player.updateKotcZone(zone);

    const nowIn = !!player.inKotcZone;
    if (wasIn !== nowIn) {
        player.inKotcZone = nowIn;
        bot.$emit(nowIn ? 'playerEnterZone' : 'playerLeaveZone', player, nowIn ? null : ZoneLeaveReason.WalkedOut);
    }
}

export default processSyncThemPacket;