import CommIn from '../comm/CommIn.js';

const processRespawnPacket = (bot) => {
    const id = CommIn.unPackInt8U();
    const seed = CommIn.unPackInt16U();
    const x = CommIn.unPackFloat();
    const y = CommIn.unPackFloat();
    const z = CommIn.unPackFloat();
    const primaryRounds = CommIn.unPackInt8U();
    const primaryStore = CommIn.unPackInt8U();
    const secondaryRounds = CommIn.unPackInt8U();
    const secondaryStore = CommIn.unPackInt8U();
    const grenades = CommIn.unPackInt8U();
    const player = bot.players[id];

    if (player) {
        player.playing = true;
        player.randomSeed = seed;

        if (player.weapons[0] && player.weapons[0].ammo) player.weapons[0].ammo.rounds = primaryRounds;
        if (player.weapons[0] && player.weapons[0].ammo) player.weapons[0].ammo.store = primaryStore;
        if (player.weapons[1] && player.weapons[1].ammo) player.weapons[1].ammo.rounds = secondaryRounds;
        if (player.weapons[1] && player.weapons[1].ammo) player.weapons[1].ammo.store = secondaryStore;

        player.grenades = grenades;
        player.position = { x, y, z };

        player.spawnShield = 120;

        bot.$emit('playerRespawn', player);
    }
}

export default processRespawnPacket;