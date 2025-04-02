import CommOut from './comm/CommOut.js';
import { CommCode } from './constants/codes.js';

class Packet {
    constructor(code, _args) {
        // args = [{type: int8, val: val}, {type: string, val: val}, etc]
        this.out = CommOut.getBuffer();
        this.out.packInt8(code);
        if (_args) {
            for (const arg of _args) {
                switch (arg.type) {
                    case 'int8':
                        this.out.packInt8(arg.val);
                        break;
                    case 'int8u':
                        this.out.packInt8U(arg.val);
                        break;
                    case 'string':
                        this.out.packString(arg.val);
                        break;
                    case 'float':
                        this.out.packFloat(arg.val);
                        break;
                }
            }
        }
    }
    get length() {
        return this.buf.length;
    }
    execute(ws) {
        this.out.send(ws);
    }
}

function RespawnPacket() {
    return new Packet(CommCode.requestRespawn)
}

function MeleePacket() {
    return new Packet(CommCode.melee)
}

function ChatPacket(msg) {
    return new Packet(CommCode.chat, [
        { type: 'string', val: msg }
    ]);
}

function SwapWeaponPacket(weaponId) {
    return new Packet(CommCode.swapWeapon, [
        { type: 'int8', val: weaponId }
    ]);
}

function ReportPacket(userId, reasonInt) {
    return new Packet(CommCode.reportPlayer, [
        { type: 'string', val: userId },
        { type: 'int8', val: reasonInt }
    ]);
}

function TeamSwitchingTraitorPacket() {
    return new Packet(CommCode.switchTeam);
}

function GameOptionsPacket(options) {
    const flags =
        (options.locked ? 1 : 0) |
        (options.noTeamChange ? 2 : 0) |
        (options.noTeamShuffle ? 4 : 0);

    const weapons = [];

    options.weaponsDisabled.forEach((v) => {
        weapons.push({ type: 'int8', val: v ? 1 : 0 });
    });

    return new Packet(CommCode.gameOptions, [
        { type: 'int8', val: options.gravity * 4 },
        { type: 'int8', val: options.damage * 4 },
        { type: 'int8', val: options.healthRegen * 4 },
        { type: 'int8', val: flags },
        ...weapons
    ]);
}

function BootPacket(uniqueId) {
    return new Packet(CommCode.bootPlayer, [
        { type: 'string', val: uniqueId }
    ]);
}

function ChangeCharacterPacket(gunId) {
    return new Packet(CommCode.changeCharacter, [
        { type: 'int8', val: gunId }
    ]);
}

function PausePacket() {
    return new Packet(CommCode.pause);
}

function ReloadPacket() {
    return new Packet(CommCode.reload);
}

function ThrowGrenadePacket(power) {
    return new Packet(CommCode.throwGrenade, [
        { type: 'float', val: power }
    ]);
}

export default {
    Packet,
    BootPacket,
    ChangeCharacterPacket,
    ChatPacket,
    GameOptionsPacket,
    MeleePacket,
    PausePacket,
    ReloadPacket,
    ReportPacket,
    RespawnPacket,
    SwapWeaponPacket,
    TeamSwitchingTraitorPacket,
    ThrowGrenadePacket
}