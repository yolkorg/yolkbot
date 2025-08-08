const report = ({ tag, message, avoid }) => {
    console.error('a bug in yolkbot has occured. it\'s probably not a big deal.');
    if (tag) console.error(`follow the instructions at https://bug.yolkbot.xyz/${tag}`);
    if (message) console.error(`${message}`);
    if (avoid) console.error('this can be avoided in the future! https://bug.yolkbot.xyz/avoid');
}

export default report;