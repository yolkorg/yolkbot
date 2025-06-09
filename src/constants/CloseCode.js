export const CloseCode = {
    gameNotFound: 4000,
    gameFull: 4001,
    badName: 4002, // not used
    mainMenu: 4003, // sent by client, not server
    gameIdleExceeded: 4004,
    corruptedLoginData0: 4005, // ...what
    corruptedLoginData1: 4006,
    corruptedLoginData2: 4007,
    corruptedLoginData3: 4008,
    corruptedLoginData4: 4009,
    corruptedLoginData5: 4010,
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

export default CloseCode;