/* eslint-disable no-underscore-dangle */

import globals from '../env/globals.js';

import { canvasListeners, getImports } from './imports.js';
import { getStringFromWasm, passStringToWasm } from './utils.js';

import { wasmBytes } from './bytes.js';

const values = {
    processListeners: [],
    processDate: null
}

const importObj = {};

let exports;

Object.assign(importObj, getImports(() => exports, values));

const initWasm = async () => {
    const wasm = await WebAssembly.instantiate(wasmBytes, importObj);
    exports = wasm.instance.exports;

    const rnd = (max) => Math.floor(Math.random() * max) + 1

    exports.start();

    const [ptr, len] = passStringToWasm(exports, [...Array(14)].map(() => Math.random().toString(36)[2]).join(''));
    exports.set_mouse_params(50, 1, 0.9, false, ptr, len);

    for (let i = 0; i < 5; i++) canvasListeners.pointermove({
        movementX: rnd(5),
        movementY: rnd(10)
    });
}

if (globals.isBrowser) initWasm();
else await initWasm();

const process = async (str, date) => {
    if (date) values.processDate = date;

    const promise = new Promise((resolve) => values.processListeners.push(resolve));

    const [ptr, len] = passStringToWasm(exports, str);
    exports.process(ptr, len);

    return promise;
}

const validate = (input) => {
    let retPtr;
    let retLen;

    try {
        const [ptr, len] = passStringToWasm(exports, input);
        const ret = exports.validate(ptr, len);

        retPtr = ret[0];
        retLen = ret[1];

        return getStringFromWasm(exports, retPtr, retLen);
    } finally {
        exports.__wbindgen_free(retPtr, retLen, 1);
    }
}

const normalizeYaw = (yaw) => {
    while (yaw < 0) yaw += 2 * Math.PI;
    while (yaw >= 2 * Math.PI) yaw -= 2 * Math.PI;
    return yaw;
};

const calculateMovements = (currentYaw, currentPitch, targetYaw, targetPitch) => {
    const normalizedCurrentYaw = normalizeYaw(currentYaw);
    const normalizedTargetYaw = normalizeYaw(targetYaw);

    let yawDiff = normalizedTargetYaw - normalizedCurrentYaw;
    if (Math.abs(yawDiff) > Math.PI) {
        yawDiff = yawDiff > 0 ? yawDiff - 2 * Math.PI : yawDiff + 2 * Math.PI;
    }

    const pitchDiff = targetPitch - currentPitch;

    const yawSensitivity = 0.0025;
    const pitchSensitivity = 0.0025;

    const movementX = Math.round(-yawDiff / yawSensitivity);
    const movementY = Math.round(-pitchDiff / pitchSensitivity);

    return { movementX, movementY };
}

const getYawPitch = () => exports.get_yaw_pitch();

const coords = (yaw, pitch) => {
    const currentYawPitch = exports.get_yaw_pitch();
    const movements = calculateMovements(currentYawPitch.yaw, currentYawPitch.pitch, yaw, pitch);

    canvasListeners.pointermove({
        movementX: movements.movementX,
        movementY: movements.movementY
    });

    const newYawPitch = exports.get_yaw_pitch();
    return newYawPitch.coords;
}

export { coords, getYawPitch, process, validate };