const CommCode = {
    announcement: 10, // unused
    updateBalance: 11,
    reload: 12,
    respawn: 13,
    respawnDenied: 14,
    pong: 15, // unused
    clientReady: 16, // don't use INCOMING, since it's mostly used to prep the UI - still sent outgoing
    requestRespawn: 17,
    joinPublicGame: 18, // unused
    joinPrivateGame: 19, // unused
    switchTeamFail: 20,
    expireUpgrade: 21, // don't use, related to forcing the user to see ads
    swapWeapon: 22,
    joinGame: 23,
    refreshGameState: 24, // don't use, related to the game pausing when you unfocused
    spawnItem: 25,
    observeGame: 26, // don't use, for mods
    ping: 27,
    bootPlayer: 28,
    banPlayer: 29, // don't use, for mods
    loginRequired: 30, // implemented in frontend but unused??
    metaGameState: 31,
    syncMe: 32,
    explode: 33,
    keepAlive: 34, // don't use, for spectator mode
    musicInfo: 35, // don't use, likely for UI purposes
    hitMeHardBoiled: 36,
    playerInfo: 37, // don't use, for admins
    challengeCompleted: 38, // don't use, see issue #37 on the github
    gameLocked: 39, // unused???, closecode gamelocked is used afaik
    reportPlayer: 40,
    banned: 41, // unused
    createPrivateGame: 42, // unused
    switchTeam: 43, // don't use outgoing, because unlike official client, we don't assume the team is switched
    changeCharacter: 44,
    pause: 45,
    gameOptions: 46,
    gameAction: 47,
    requestGameOptions: 48,
    gameJoined: 49,
    socketReady: 50,
    addPlayer: 51,
    removePlayer: 52,
    fire: 53,
    melee: 54,
    throwGrenade: 55,
    info: 56, // unused
    eventModifier: 57,
    hitThem: 58,
    hitMe: 59,
    collectItem: 60,
    chlgPlayerRerollInGame: 61, // don't use, see issue #37 on the github
    playerInGameReward: 62, // unused

    // this is possibly the most comedic thing i've ever seen
    // they started coding the commcode incoming by creating commin
    // then, they declared a random variable that got broken because
    // you're not supposed to declare variables in switch statements
    // and then unpacked something and then never used it
    // and then seemed to just leave it there!!
    // top 10 bwd // https://i.imgur.com/a1WNR7Y.png 
    playerRewards: 63,

    chat: 64,
    syncThem: 65,
    syncAmmo: 66, // unused
    die: 67, // unused
    beginShellStreak: 68,
    endShellStreak: 69,
    startReload: 70 // unused
}

const CloseCode = {
    gameNotFound: 4000,
    gameFull: 4001,
    badName: 4002,
    mainMenu: 4003,
    gameIdleExceeded: 4004,
    corruptedLoginData: 4010,
    gameMaxPlayersExceeded: 4011,
    gameDestroyUser: 4012,
    joinGameOutOfOrder: 4013,
    gameShuttingDown: 4014,
    readyBeforeReady: 4015,
    booted: 4016,
    gameErrorOnUserSocket: 4017,
    uuidNotFound: 4018,
    sessionNotFound: 4019,
    clusterFullCpu: 4020,
    clusterFullMem: 4021,
    noClustersAvailable: 4022,
    locked: 4023
}

export {
    CommCode,
    CloseCode
}