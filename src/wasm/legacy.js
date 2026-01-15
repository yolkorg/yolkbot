/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */

// https://github.com/zastlx/shell-wasm-node
// thanks zastix! yolkbot wouldn't be possible without your help <3

import { wasmBytes } from './bytes.js';

const normalizeYaw = (yaw) => ((yaw % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

export class WASM {
    wasm;

    debug = false;

    canvasListeners = {};
    mockElement = { textContent: '' };

    processDate = null;
    processListeners = [];

    async initWasm() {
        const wasmInstantiated = await WebAssembly.instantiate(wasmBytes, this.getImports());
        this.wasm = wasmInstantiated.instance.exports;

        this.wasm.start();

        const [ptr, len] = this.passStringToWasm([...Array(14)].map(() => Math.random().toString(36)[2]).join(''));
        this.wasm.set_mouse_params(50, 1, 1, false, ptr, len);

        const movementX = Math.random() * 10 + 100;
        const movementY = Math.random() * 10 + 100;

        this.canvasListeners.pointermove({ movementX, movementY });
    }

    getStringFromWasm = (ptr, len) => {
        if (!this.wasm) return '';

        ptr >>>= 0;
        return (new TextDecoder()).decode((new Uint8Array(this.wasm.memory.buffer)).subarray(ptr, ptr + len));
    }

    passStringToWasm = (str) => {
        if (!this.wasm) return;

        const buf = (new TextEncoder()).encode(str);
        const ptr = this.wasm.__wbindgen_malloc(buf.length, 1) >>> 0;
        (new Uint8Array(this.wasm.memory.buffer)).subarray(ptr, ptr + buf.length).set(buf);
        return [ptr, buf.length];
    }

    addToExternrefTable = (obj) => {
        if (!this.wasm) return;

        const idx = this.wasm.__externref_table_alloc();
        this.wasm.__wbindgen_export_2.set(idx, obj);
        return idx;
    }

    getImports() {
        const CLOSURE_DTORS = new FinalizationRegistry((state) => {
            this.wasm.__wbindgen_export_5.get(state.dtor)(state.a, state.b)
        });

        const makeMutClosure = (arg0, arg1, dtor, f) => {
            const state = { a: arg0, b: arg1, cnt: 1, dtor };
            const real = (...args) => {
                state.cnt++;
                const a = state.a;
                state.a = 0;
                try {
                    return f(a, state.b, ...args);
                } finally {
                    if (--state.cnt === 0) {
                        this.wasm.__wbindgen_export_5.get(state.dtor)(a, state.b);
                        CLOSURE_DTORS.unregister(state);
                    } else state.a = a;
                }
            };
            real.original = state;
            CLOSURE_DTORS.register(real, state, state);
            return real;
        }

        const __wbg_adapter_6 = (arg0, arg1, arg2) => this.wasm.closure9_externref_shim(arg0, arg1, arg2);

        return {
            wbg: {
                __wbg_addEventListener_775911544ac9d643: (_t, arg1, arg2, callback) =>
                    this.canvasListeners[this.getStringFromWasm(arg1, arg2)] = callback,
                __wbg_appendChild_87a6cc0aeb132c06: () => { },
                __wbg_axes_57e916a6e0ffb3e4: () => { },
                __wbg_body_8822ca55cb3730d2: () => this.addToExternrefTable(null),
                __wbg_call_13410aac570ffff7: () => { },
                __wbg_createElement_4909dfa2011f2abe: () => this.mockElement,
                __wbg_document_7d29d139bd619045: () => this.addToExternrefTable({}),
                __wbg_from_88bc52ce20ba6318: (...args) => Array.from(args[0]),
                __wbg_getGamepads_c373aed0f1e5e4a6: (...args) => args[0].getGamepads(),
                __wbg_get_458e874b43b18b25: (...args) => Reflect.get(args[0], args[1]),
                __wbg_get_0da715ceaecea5c8: (...args) => args[0][args[1] >>> 0],
                __wbg_has_b89e451f638123e3: () => true,
                __wbg_instanceof_Gamepad_2987f05b50f4775a: () => true,
                __wbg_instanceof_Window_12d20d558ef92592: () => true,
                __wbg_isTrusted_04e871d8dde8ea8a: () => true,
                __wbg_length_186546c51cd61acd: (...args) => args[0].length,
                __wbg_movementX_0ef0e79f7b9168fc: (...args) => args[0].movementX,
                __wbg_movementY_875c2fc2aabd99bf: (...args) => args[0].movementY,
                __wbg_navigator_65d5ad763926b868: (...args) => args[0].navigator,
                __wbg_new_19c25a3f2fa63a02: () => new Object(),
                __wbg_newnoargs_254190557c45b4ec: () => { },
                __wbg_now_1e80617bcee43265: () => this.processDate || Date.now(),
                __wbg_set_453345bcda80b89a: (...args) => Reflect.set(args[0], args[1], args[2]),
                __wbg_settextContent_b55fe2f5f1399466: async (...args) => {
                    this.mockElement.textContent = this.getStringFromWasm(args[1], args[2]);
                    this.processListeners.forEach((listener) => listener(this.mockElement.textContent));
                },
                __wbg_static_accessor_GLOBAL_8921f820c2ce3f12: () => { },
                __wbg_static_accessor_GLOBAL_THIS_f0a4409105898184: () => { },
                __wbg_static_accessor_SELF_995b214ae681ff99: () => this.addToExternrefTable({}),
                __wbg_static_accessor_WINDOW_cde3890479c675ea: () => { },
                __wbg_wbindgenbooleanget_3fe6f642c7d97746: (arg0) => {
                    if (typeof arg0 === 'boolean') return arg0 ? 1 : 0;
                    return null;
                },
                __wbg_wbindgendebugstring_99ef257a3ddda34d: (arg0, arg1) => {
                    const str = this.getStringFromWasm(arg0, arg1);
                    const [ptr, len] = this.passStringToWasm(str);
                    const dv = new DataView(this.wasm.memory.buffer);
                    dv.setInt32(arg0 + 4 * 1, len, true);
                    dv.setInt32(arg0 + 4 * 0, ptr, true);
                },
                __wbg_wbindgenisnull_f3037694abe4d97a: (arg0) => arg0 === null ? 1 : 0,
                __wbg_wbindgenisundefined_c4b71d073b92f3c5: (arg0) => typeof arg0 === 'undefined' ? 1 : 0,
                __wbg_wbindgennumberget_f74b4c7525ac05cb: (arg0, arg1) => {
                    const obj = arg1;
                    const ret = typeof (obj) === 'number' ? obj : null;
                    const dv = new DataView(this.wasm.memory.buffer);
                    dv.setFloat64(arg0 + 8 * 1, ret, true);
                    dv.setInt32(arg0 + 4 * 0, 1, true);
                },
                __wbg_wbindgenthrow_451ec1a8469d7eb6: (a, b) => this.debug && console.log('call 31', a, b),
                __wbindgen_cast_01559742fdcca8af: (arg0, arg1) => makeMutClosure(arg0, arg1, 8, __wbg_adapter_6),
                __wbindgen_cast_2241b6af4c4b2941: (arg0, arg1) => this.getStringFromWasm(arg0, arg1),
                __wbindgen_cast_2495c10526b24646: (arg0, arg1) => makeMutClosure(arg0, arg1, 8, __wbg_adapter_6),
                __wbindgen_cast_d6cd19b81560fd6e: (arg0) => arg0,
                __wbindgen_init_externref_table: () => {
                    const table = this.wasm.__wbindgen_export_2;
                    const offset = table.grow(4);
                    table.set(0, null);
                    table.set(offset + 0, null);
                    table.set(offset + 1, null);
                    table.set(offset + 2, true);
                    table.set(offset + 3, false);
                }
            }
        }
    }

    // public use function divider

    async process(str, date) {
        if (date) this.processDate = date;

        const promise = new Promise((resolve) => this.processListeners.push(resolve));

        const [ptr, len] = this.passStringToWasm(str);
        this.wasm.process(ptr, len);

        return promise;
    }

    validate(input) {
        let retPtr;
        let retLen;

        try {
            const [ptr, len] = this.passStringToWasm(input);
            const ret = this.wasm.validate(ptr, len);

            retPtr = ret[0];
            retLen = ret[1];

            return this.getStringFromWasm(retPtr, retLen);
        } finally {
            this.wasm.__wbindgen_free(retPtr, retLen, 1);
        }
    }

    getYawPitch = () => this.wasm.get_yaw_pitch();
    resetYawPitch = () => this.wasm.reset_yaw_pitch();

    coords(targetYaw, targetPitch) {
        this.wasm.reset_yaw_pitch();

        const current = this.wasm.get_yaw_pitch();

        const normalizedCurrentYaw = normalizeYaw(current.yaw);
        const normalizedTargetYaw = normalizeYaw(targetYaw);

        const yawDiff = ((normalizedTargetYaw - normalizedCurrentYaw) + Math.PI) % (2 * Math.PI) - Math.PI;
        const pitchDiff = targetPitch - current.pitch;

        const movementX = Math.round(-yawDiff / 0.0025);
        const movementY = Math.round(-pitchDiff / 0.0025);

        this.canvasListeners.pointermove({ movementX, movementY });

        const newYawPitch = this.wasm.get_yaw_pitch();
        return newYawPitch.coords;
    }
}

export default WASM;