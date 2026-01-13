import { API } from '../src/api.js';
import { Bot } from '../src/bot.js';
import * as Enums from '../src/enums.js';
import { yolkws } from '../src/socket.js';
import * as util from '../src/util.js';

import { GamePlayer } from '../src/bot/GamePlayer.js';

import * as Constants from './constants/index.js';

import { Challenges } from './constants/challenges.js';
import { CloseCode } from './constants/CloseCode.js';
import { CommCode } from './constants/CommCode.js';
import * as Guns from './constants/guns.js';
import { Maps } from './constants/maps.js';
import { Regions } from './constants/regions.js';

import { CommIn } from '../src/comm/CommIn.js';
import { CommOut } from '../src/comm/CommOut.js';

import { default as Dispatches } from './dispatches/index.js';

import * as WASM from './wasm/direct.js';

const yolkbot = {
    API,
    Bot,
    Enums,
    yolkws,
    util,

    GamePlayer,

    Comm: { CommIn, CommOut },

    Constants,
    Challenges,
    CloseCode,
    CommCode,
    Guns,
    Items: [],
    Maps,
    Regions,

    Dispatches,

    WASM
};

window.yolkbot = yolkbot;