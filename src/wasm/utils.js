/* eslint-disable no-underscore-dangle */

export const getStringFromWasm = (wasm, ptr, len) => {
    ptr >>>= 0;
    return (new TextDecoder()).decode((new Uint8Array(wasm.memory.buffer)).subarray(ptr, ptr + len));
}

export const passStringToWasm = (wasm, str) => {
    const buf = (new TextEncoder()).encode(str);
    const ptr = wasm.__wbindgen_malloc(buf.length, 1) >>> 0;
    (new Uint8Array(wasm.memory.buffer)).subarray(ptr, ptr + buf.length).set(buf);
    return [ptr, buf.length];
}

export const addToExternrefTable = (wasm, obj) => {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_2.set(idx, obj);
    return idx;
}