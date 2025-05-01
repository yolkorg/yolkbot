export const UserAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36';

let js = '';

export const getJS = async () => {
    if (js) return js;

    const data = await fetch('https://archive.getstate.farm/js/latest.js', {
        headers: {
            'User-Agent': UserAgent
        }
    });

    js = await data.text();

    return js;
}