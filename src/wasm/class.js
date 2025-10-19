/* eslint-disable camelcase */
/* eslint-disable no-empty-function */
/* eslint-disable no-underscore-dangle */

// https://github.com/zastlx/shell-wasm-node
// thanks zastix! yolkbot wouldn't be possible without your help <3

import globals from '../env/globals.js';

import { wasmBytes } from './bytes.js';
import { calculateMovements } from './util.js';

const magicString = '\nvar comp_spinner_overlay = {\n\ttemplate: \'#spinner-overlay-template\',\n\tcomponents: {\n\t\t\'wobbly-egg\': comp_wobbly_egg\n\t},\n\tprops: [\'loc\', \'adblockerbanner\', \'hideAds\', \'adUnit\', \'accountDate\'],\n\t\n\tdata: function () {\n\t\treturn {\n\t\t\tisShowing: false,\n\t\t\theader: \'\',\n\t\t\tfooter: \'\',\n\t\t\tadIsShowing: false,\n\t\t\tisShowTips: false,\n\t\t\ttipKey: null,\n\t\t\ttips: [],\n\t\t\ttip: \'\',\n\t\t\teggGuyImg: \'img/shellShockers_loadingTipEgg.webp\',\n\t\t\tgoodBrowser: true,\n\t\t\tbrowserTipShown: false,\n\t\t}\n\t},\n\n\tmounted() {\n\t\tthis.isNotChrome().then(result => {\n\t\t\tif (result) {\n\t\t\t\tthis.goodBrowser = false;\n\t\t\t}\n\t\t});\n\t},\n\n\tmethods: {\n\t\tshow: function (headerLocKey, footerLocKey, showTips) {\n\t\t\tthis.header = this.loc[headerLocKey];\n\t\t\tthis.footer = this.loc[footerLocKey];\n\t\t\tthis.isShowing = true;\n\t\t\tthis.isShowTips = showTips;\n\t\t},\n\n\t\tshowSpinnerLoadProgress: function (percent) {\n\t\t\tvar msg = this.loc[\'ui_game_loading\'];\n\t\t\tthis.header = this.loc[\'building_map\'];\n\t\t\tthis.footer = \'{0}... {1}%\'.format(msg, percent);\n\t\t\tthis.isShowTips = true;\n\t\t\tthis.isShowing = true;\n\t\t},\n\n\t\thide: function () {\n\t\t\tthis.isShowing = false;\n\t\t\tthis.isShowTips = this.isShowing;\n\t\t\tthis.$emit(\'close-display-ad\');\n\t\t},\n\n\t\thideDisplayAd() {\n\t\t\tthis.adIsShowing = false;\n\t\t\tconsole.log(\'do it\');\n\t\t},\n\t\tshowDisplayAd() {\n\t\t\tthis.adIsShowing = true;\n\t\t},\n\t\ttoggleDisplayAd() {\n\t\t\treturn this.adIsShowing = this.adIsShowing ? false : true;\n\t\t},\n\t\tgetTipKey() {\n\t\t\tif (!this.accountDate) {\n\t\t\t\tthis.tipKey = \'tipNew_\';\n\t\t\t} else {\n\t\t\t\tif (!this.accountDays) {\n\t\t\t\t\tthis.accountDays = Math.ceil((new Date().getTime() - new Date(this.accountDate).getTime()) / (1000 * 3600 * 24));\n\t\t\t\t}\n\t\t\t\tif (this.accountDays <= 14) {\n\t\t\t\t\tthis.tipKey = \'tipNew_\';\n\t\t\t\t} else {\n\t\t\t\t\tthis.tipKey = \'tip_\';\n\t\t\t\t}\n\t\t\t}\n\t\t},\n\t\trandomTip() {\n\t\t\tif (!this.goodBrowser && !this.browserTipShown) {\n\t\t\t\tthis.tip = \'tip_ofthe_day_107\';\n\t\t\t\tthis.browserTipShown = true;\n\t\t\t\treturn;\n\t\t\t}\n\n\t\t\tif (this.tipKey === null) {\n\t\t\t\tthis.getTipKey();\n\t\t\t}\n\n\t\t\tif (this.tips.length === 0) {\n\t\t\t\tObject.keys(this.loc).forEach(key => {\n\t\t\t\t\tif (key.startsWith(this.tipKey)) {\n\t\t\t\t\t\tthis.tips.push(key);\n\t\t\t\t\t}\n\t\t\t\t});\n\t\t\t}\n\t\t\tthis.tip = this.tips[Math.floor(Math.random() * this.tips.length)];\n\t\t},\n\n\t\tasync isNotChrome() {\n\t\t\tif (navigator.userAgentData) {\n\t\t\t\tconst brands = navigator.userAgentData.brands || [];\n\t\t\t\tconst isChrome = brands.some(brand => brand.brand === \'Google Chrome\');\n\t\t\t\treturn !isChrome;\n\t\t\t} else {\n\t\t\t\t// Fallback to userAgent for older browsers\n\t\t\t\treturn this.isNotChromeFallback();\n\t\t\t}\n\t\t},\n\t\tisNotChromeFallback() {\n\t\t\tconst ua = navigator.userAgent;\n\t\t\treturn !(ua.includes(\'Chrome\') && !ua.includes(\'Edg\') && !ua.includes(\'OPR\'));\n\t\t}\n\t},\n\twatch: {\n\t\tisShowing(val, old) {\n\t\t\tif (val && !old) {\n\t\t\t\tthis.randomTip();\n\t\t\t}\n\t\t}\n\t}\n};\n';

export class WASM {
    wasm;

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

        const movementX = Math.floor(Math.random() * 10) + 1;
        const movementY = Math.floor(Math.random() * 10) + 1;

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

        let iter = 1;

        return {
            wbg: {
                __wbg_addEventListener_90e553fdce254421: (_t, arg1, arg2, callback) =>
                    this.canvasListeners[this.getStringFromWasm(arg1, arg2)] = callback,
                __wbg_appendChild_8204974b7328bf98: () => { },
                __wbg_axes_b1da727bd9ea422d: () => { },
                __wbg_body_942ea927546a04ba: () => this.addToExternrefTable(null),
                __wbg_call_672a4d21634d4a24: () => { },
                __wbg_childNodes_c4423003f3a9441f: () => [],
                __wbg_createElement_8c9931a732ee2fea: () => this.mockElement,
                __wbg_document_d249400bd7bd996d: () => this.addToExternrefTable({}),
                __wbg_from_2a5d3e218e67aa85: (...args) => Array.from(args[0]),
                __wbg_getGamepads_1f997cef580c9088: (...args) => args[0].getGamepads(),
                __wbg_get_67b2ba62fc30de12: (...args) => Reflect.get(args[0], args[1]),
                __wbg_get_b9b93047fe3cf45b: (...args) => args[0][args[1] >>> 0],
                __wbg_has_a5ea9117f258a0ec: () => true,
                __wbg_innerText_df9aeb9435e40973: () => { },
                __wbg_instanceof_Gamepad_365ec8404255ce00: () => true,
                __wbg_instanceof_HtmlElement_51378c201250b16c: () => true,
                __wbg_instanceof_Window_def73ea0955fc569: () => true,
                __wbg_isTrusted_cc994b7949c53593: () => true,
                __wbg_item_8be407c958853a13: (...args) => this.addToExternrefTable(args[0][args[1] >>> 0]),
                __wbg_length_49b2ba67f0897e97: () => {
                    iter--;
                    if (iter <= 0) {
                        iter = 1;
                        return 0;
                    }

                    return iter;
                },
                __wbg_length_e2d2a49132c1b256: (...args) => args[0].length,
                __wbg_movementX_1aa05f864931369b: (...args) => args[0].movementX,
                __wbg_movementY_8acfedb38a70e624: (...args) => args[0].movementY,
                __wbg_navigator_1577371c070c8947: (...args) => args[0].navigator,
                __wbg_new_405e22f390576ce2: () => new Object(),
                __wbg_newnoargs_105ed471475aaf50: () => { },
                __wbg_nodeType_5e1153141daac26a: () => 3,
                __wbg_now_807e54c39636c349: () => this.processDate || Date.now(),
                __wbg_set_bb8cecf6a62b9f46: (...args) => Reflect.set(args[0], args[1], args[2]),
                __wbg_settextContent_d29397f7b994d314: async (...args) => {
                    this.mockElement.textContent = this.getStringFromWasm(args[1], args[2]);
                    this.processListeners.forEach((listener) => listener(this.mockElement.textContent));
                },
                __wbg_static_accessor_GLOBAL_88a902d13a557d07: () => { },
                __wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0: () => { },
                __wbg_static_accessor_SELF_37c5d418e4bf5819: () => this.addToExternrefTable({}),
                __wbg_static_accessor_WINDOW_5de37043a91a9c40: () => { },
                __wbg_textContent_215d0f87d539368a: (outPtr, targetElement) => {
                    const [ptr, len] = this.passStringToWasm(targetElement === this.mockElement ? this.mockElement.textContent : magicString);
                    const dv = new DataView(this.wasm.memory.buffer);
                    dv.setInt32(outPtr + 4 * 1, len, true);
                    dv.setInt32(outPtr + 4 * 0, ptr, true);
                },
                __wbindgen_debug_string: () => { },
                __wbindgen_init_externref_table: () => { },
                __wbindgen_throw: () => { },
                __wbindgen_number_new: (arg0) => arg0,
                __wbindgen_string_new: (arg0, arg1) => this.getStringFromWasm(arg0, arg1),
                __wbindgen_string_get: (arg0, arg1) => {
                    const str = this.getStringFromWasm(arg0, arg1);
                    const [ptr, len] = this.passStringToWasm(str);
                    const dv = new DataView(this.wasm.memory.buffer);
                    dv.setInt32(arg0 + 4 * 1, len, true);
                    dv.setInt32(arg0 + 4 * 0, ptr, true);
                },
                __wbindgen_is_undefined: (arg0) => typeof arg0 === 'undefined' ? 1 : 0,
                __wbindgen_is_null: (arg0) => arg0 === null ? 1 : 0,
                __wbindgen_boolean_get: (arg0) => {
                    const v = arg0;
                    const ret = typeof (v) === 'boolean' ? (v ? 1 : 0) : 2;
                    return ret;
                },
                __wbindgen_closure_wrapper94: (arg0, arg1) => makeMutClosure(arg0, arg1, 31, (arg2, arg3, arg4) => this.wasm.closure28_externref_shim(arg2, arg3, arg4)),
                __wbindgen_closure_wrapper95: (arg0, arg1) => makeMutClosure(arg0, arg1, 31, (arg2, arg3, arg4) => this.wasm.closure28_externref_shim(arg2, arg3, arg4)),
                __wbindgen_number_get: (arg0, arg1) => {
                    const obj = arg1;
                    const ret = typeof (obj) === 'number' ? obj : null;
                    const dv = new DataView(this.wasm.memory.buffer);
                    dv.setFloat64(arg0 + 8 * 1, ret, true);
                    dv.setInt32(arg0 + 4 * 0, 1, true);
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

    coords(yaw, pitch) {
        const currentYP = this.wasm.get_yaw_pitch();
        const { movementX, movementY } = calculateMovements(currentYP.yaw, currentYP.pitch, yaw, pitch);

        this.canvasListeners.pointermove({ movementX, movementY });

        const newYawPitch = this.wasm.get_yaw_pitch();
        return newYawPitch.coords;
    }
}

const wasm = new WASM();

if (globals.isBrowser) wasm.initWasm();
else await wasm.initWasm();

export default wasm;