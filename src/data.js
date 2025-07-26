import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const yolkbotDir = path.join(os.homedir(), '.yolkbot');
const localDir = path.join(yolkbotDir, 'data');

if (!fs.existsSync(yolkbotDir)) fs.mkdirSync(yolkbotDir, { recursive: true });
if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });

const manifestPath = path.join(localDir, 'manifest.json');

const requiredValues = ['challenges', 'CommCode', 'items', 'maps', 'regions'];

class DataLoaderClass {
    #getText = async (url) => await (await fetch(url)).text();

    async loadManifest() {
        const remoteManifest = JSON.parse(await this.#getText('https://data.yolkbot.xyz/manifest.json'));
        this.manifest = remoteManifest;

        if (!fs.existsSync(manifestPath)) {
            this.load(requiredValues);
            fs.writeFileSync(manifestPath, JSON.stringify(remoteManifest, null, 4));
        } else {
            const local = JSON.parse(fs.readFileSync(manifestPath));
            const mustLoad = [];
            requiredValues.forEach((value) => {
                if (local[value].hash !== remoteManifest[value].hash) mustLoad.push(value);
            });
            this.load(mustLoad);
        }
    }

    async load(values) {
        values.forEach((value) => {
            const p = this.manifest[value].path;
            this.#getText(`https://data.yolkbot.xyz${p}`).then((data) => {
                const filePath = path.join(localDir, p);
                if (!fs.existsSync(path.dirname(filePath))) {
                    fs.mkdirSync(path.dirname(filePath), { recursive: true });
                }
                fs.writeFileSync(filePath, data);
            }).catch((err) => {
                console.error(`[DataLoader] Failed to load ${value}:`, err);
                console.error(`[DataLoader] URL: https://data.yolkbot.xyz${this.manifest[value].path}`);
            });
        })
    }

    getFile(fileName) {
        const file = path.join(localDir, fileName);
        return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : null;
    }
}

const DataLoader = new DataLoaderClass();
export default DataLoader;