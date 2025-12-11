import { API } from '../../src/api.js';
import { Bot } from '../../src/bot.js';
import { GamePlayer } from '../../src/bot/GamePlayer.js';

import { default as Dispatches } from '../../src/dispatches/index.js';

import CommIn from '../../src/comm/CommIn.js';
import CommOut from '../../src/comm/CommOut.js';

import * as Constants from '../../src/constants/index.js';
import * as Guns from '../../src/constants/guns.js';
import { Maps } from '../../src/constants/maps.js';

const yolkbot = {
    API,
    Bot,
    GamePlayer,
    Dispatches,
    Comm: { CommIn, CommOut },
    Constants,
    Guns,
    Maps
};

window.yolkbot = yolkbot;