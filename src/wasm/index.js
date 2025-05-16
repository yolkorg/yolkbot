// to change the version of the WASM just change "newest" to the version you want to use
import { readFile } from "fs/promises";
import { imports } from "./imports.js";
import { getStringFromWasm, passStringToWasm } from "./utils.js";
const wasmBytes = await readFile(new URL("./wasm_loader.wasm", import.meta.url));

const wasm = await WebAssembly.instantiate(wasmBytes, imports);
const exports = wasm.instance.exports;

export const getWasm = () => {
    return exports;
}

const process = (str) => {
    const [ptr, len] = passStringToWasm(str);
    exports.process(ptr, len);
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

// NOTE: all the imports will log their name when they are called, this can help with seeing what the WASM is doing.

// this will output the transformed normal js code to out/shellshock.js
// const { data } = await axios.get("https://shellshock.io/js/shellshock.js?" + Date.now());
// process(data);

// // outputs the result of wasm.validate (window.validate)
// // WARNING: this is broken on the newest WASM and I'm not sure why, it seems like it gets stuck in an very very long for loop, it will work eventually but it will take FOREVER
// // if you plan to use this i would suggest using the 5_14_2025 version of the WASM, which has the same SALT but without the loop
// console.log("validate");
// console.log(`validate("test"): ${validate("test")}`);


// // runs wasm.start not 100% sure what it does
// // exports.start();


export { validate };