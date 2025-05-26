/* eslint-disable no-underscore-dangle */

import { canvasListeners, imports } from './imports.js';
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

const coords = (yaw, pitch) => {
    if (!canvasListeners.pointermove) {
        exports.start();

        const [ptr, len] = passStringToWasm([...Array(14)].map(() => Math.random().toString(36)[2]).join(''));
        exports.set_mouse_params(50, 1, 0.9, false, ptr, len);
    }

    const currentYawPitch = exports.get_yaw_pitch();
    const movements = calculateMovements(currentYawPitch.yaw, currentYawPitch.pitch, yaw, pitch);

    canvasListeners.pointermove({
        isTrusted: true,
        movementX: movements.movementX,
        movementY: movements.movementY
    });

    const newYawPitch = exports.get_yaw_pitch();
    return newYawPitch.coords;
}

export { coords, process, validate };