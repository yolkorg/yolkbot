/* eslint-disable no-underscore-dangle */

import { getWasm } from './wrapper.js';

export const getStringFromWasm = (ptr, len) => {
    ptr >>>= 0;
    return (new TextDecoder()).decode((new Uint8Array(getWasm().memory.buffer)).subarray(ptr, ptr + len));
}

export const passStringToWasm = (str) => {
    const buf = (new TextEncoder()).encode(str);
    const ptr = getWasm().__wbindgen_malloc(buf.length, 1) >>> 0;
    (new Uint8Array(getWasm().memory.buffer)).subarray(ptr, ptr + buf.length).set(buf);
    return [ptr, buf.length];
}

export const addToExternrefTable = (obj) => {
    const idx = getWasm().__externref_table_alloc();
    getWasm().__wbindgen_export_2.set(idx, obj);
    return idx;
}