/* eslint-disable no-underscore-dangle */

import { imports } from './imports.js';
import { getStringFromWasm, passStringToWasm } from './utils.js';

import { wasmBytes } from './bytes.js';

const wasm = await WebAssembly.instantiate(wasmBytes, imports);
const exports = wasm.instance.exports;

export const getWasm = () => exports;

export let jsResolve;
export let dateToUse;

const process = async (str, dtu) => {
    if (dtu) dateToUse = dtu;

    const promise = new Promise((resolve) => {
        jsResolve = resolve;
    });

    const [ptr, len] = passStringToWasm(str);
    exports.process(ptr, len);

    return promise;
}

const validate = (input) => {
    let retPtr;
    let retLen;

    try {
        const [ptr, len] = passStringToWasm(input);
        const ret = exports.validate(ptr, len);

        retPtr = ret[0];
        retLen = ret[1];
        return getStringFromWasm(retPtr, retLen);
    } finally {
        exports.__wbindgen_free(retPtr, retLen, 1);
    }
}

export { process, validate };