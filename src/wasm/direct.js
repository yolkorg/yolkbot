/* eslint-disable camelcase */

// all of this code was written by me (villainsrule) from scratch
// any resemblance to other code is purely coincidental :3

const magicString = '3496afa51f2a553ea1fc5211400c000b';

const hexToUint8Array = (hex) => new Uint8Array(hex.match(/.{2}/g).map(b => parseInt(b, 16)));
const encoder = new TextEncoder();

export const validate = async (input) => {
    if (typeof process !== 'undefined' && typeof process.getBuiltinModule === 'function') {
        const crypto = process.getBuiltinModule('node:crypto');
        const salt = Buffer.from(magicString, 'hex');
        return crypto.createHmac('sha256', salt).update(input).digest('hex');
    }

    const salt = hexToUint8Array(magicString);

    const key = await crypto.subtle.importKey('raw', salt, { name: 'HMAC', hash: { name: 'SHA-256' } }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(input));

    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

const mockLoadi8U = (addr) => {
    const base64Table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    return base64Table.charCodeAt(addr - 1050359);
}

export const getCoords = (yaw11, pitch10) => {
    let local_9 = Math.round(yaw11 / (Math.PI * 2) * 65535);
    let local_4 = 0;
    const local_12 = Math.round((pitch10 + 1.5) / 3.0 * 32767);

    const temp_yaw = local_9 < 0 ? 0 : local_9;
    local_9 = temp_yaw > 65535 ? 65535 : temp_yaw;

    let yaw_i32 = Math.trunc(local_9);
    if (yaw_i32 < 0) yaw_i32 = 0;
    if (yaw_i32 > 4294967295) yaw_i32 = 4294967295;

    yaw_i32 = local_9 >= 0 ? yaw_i32 : 0;
    yaw_i32 = local_9 > 65535 ? 0 : yaw_i32;

    let local_5 = yaw_i32;
    local_4 ^= local_5;

    let temp_pitch = local_12 < 0 ? 0 : local_12;

    local_9 = temp_pitch;
    temp_pitch = local_9 > 32767 ? 32767 : local_9;
    local_9 = temp_pitch;

    let pitch_i32 = Math.trunc(local_9);
    if (pitch_i32 < 0) pitch_i32 = 0;
    if (pitch_i32 > 4294967295) pitch_i32 = 4294967295;

    pitch_i32 = local_9 >= 0 ? pitch_i32 : 0;
    pitch_i32 = local_9 > 65535 ? 0 : pitch_i32;

    let local_3 = pitch_i32;
    let local_6 = local_3;
    let local_01 = local_4 ^ local_6;

    const pitch_low_byte = local_01 & 255;
    const yaw_shifted = local_4 << 8;

    const yaw_byte_high = (local_4 & 65280) >>> 8;
    const yaw_combined = ((yaw_shifted | yaw_byte_high) >>> 0);

    local_3 = yaw_combined;

    const local_7 = pitch_low_byte ^ local_3;
    const pitch_shifted = local_01 << 8;

    local_01 = pitch_shifted | ((local_01 & 65280) >>> 8);
    local_5 ^= local_6;
    local_6 = local_01 ^ (local_5 & 255);
    local_5 = (local_5 << 8) | ((local_5 & 65280) >>> 8);
    local_4 = local_5 ^ (local_4 & 255);

    const letters = [];

    letters[3] = mockLoadi8U(1050359 + (local_6 & 63));
    letters[7] = mockLoadi8U(1050359 + ((local_3 >>> 8) & 63));
    letters[4] = mockLoadi8U(1050359 + ((local_01 >>> 10) & 63));
    letters[0] = mockLoadi8U(1050359 + ((local_4 & 252) >>> 2));
    letters[5] = mockLoadi8U(1050359 + (((local_01 >>> 4) & 48) | ((local_7 >>> 4) & 15)));
    letters[2] = mockLoadi8U(1050359 + (((local_5 >>> 6) & 60) | ((local_6 >>> 6) & 3)));
    letters[6] = mockLoadi8U(1050359 + ((((local_3 >>> 14) & 3) | (local_7 << 2)) & 63));
    letters[1] = mockLoadi8U(1050359 + ((((local_5 >>> 12) & 15) | (local_4 << 4)) & 63));

    return String.fromCharCode(...letters);
}