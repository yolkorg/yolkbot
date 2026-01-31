// https://techblog.willshouse.com/2012/01/03/most-common-user-agents

const latestChromeVersion = 143 as const;
const latestFirefoxVersion = 146 as const;
// const selectedChromeOSBuild = '16181.61.0';

const agents = [
    `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${latestChromeVersion}.0.0.0 Safari/537.36`,
    `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${latestChromeVersion}.0.0.0 Safari/537.36`,
    `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${latestFirefoxVersion}.0) Gecko/20100101 Firefox/${latestFirefoxVersion}.0`,
    `Mozilla/5.0 (X11; Linux x86_64; rv:${latestFirefoxVersion}.0) Gecko/20100101 Firefox/${latestFirefoxVersion}.0`,
    `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${latestChromeVersion}.0.0.0 Safari/537.36`,
    `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${latestChromeVersion}.0.0.0 Safari/537.36 Edg/${latestChromeVersion}.0.0.0`,
    `Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:${latestFirefoxVersion}.0) Gecko/20100101 Firefox/${latestFirefoxVersion}.0`
    // `Mozilla/5.0 (X11; CrOS x86_64 ${selectedChromeOSBuild}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${latestChromeVersion} Safari/537.36`,
    // `Mozilla/5.0 (X11; CrOS armv7l ${selectedChromeOSBuild}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${latestChromeVersion} Safari/537.36`,
    // `Mozilla/5.0 (X11; CrOS aarch64 ${selectedChromeOSBuild}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${latestChromeVersion} Safari/537.36`
] as const;

const UserAgent: string = agents[Math.floor(Math.random() * agents.length)];
export default UserAgent;