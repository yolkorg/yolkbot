import fs from 'fs';
import player from '../src/player';
import manager from '../src/manager';
import dispatch from '../src/dispatches';

const NUM_CREAMERS = 100; // Go wild, it's super light

const CODE = 'jork-strp-club';

const p = [];

const proxyList = JSON.parse(fs.readFileSync('proxies.json'))

for (let i = 0; i < NUM_CREAMERS; i++) {
    p.push(new player.Player({ name: 'StreamCreamer', proxy: proxyList[i] }))
}

const man = new manager.Manager(p);

man.on('playerJoin', (me) => {
    me.dispatch(new dispatch.SpawnDispatch())
});  

man.on('playerRespawn', (me) => {
    me.dispatch(new dispatch.SpawnDispatch())
    me.dispatch(new dispatch.ChatDispatch('Professor Creamer on top.'))
})

await man.join(CODE);