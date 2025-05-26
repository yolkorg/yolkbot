/* eslint-disable no-underscore-dangle */
/* eslint-disable no-empty-function */
/* eslint-disable arrow-body-style */
/* eslint-disable camelcase */

// thx to https://github.com/zastlx/shell-wasm-node <3
// zastix is very amazing <3

import { jsResolve, dateToUse, getWasm } from './wrapper.js';
import { addToExternrefTable, getStringFromWasm, passStringToWasm } from './utils.js';

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => { }, unregister: () => { } }
    : new FinalizationRegistry((state) => {
        getWasm().__wbindgen_export_5.get(state.dtor)(state.a, state.b)
    });

export const makeMutClosure = (arg0, arg1, dtor, f) => {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                getWasm().__wbindgen_export_5.get(state.dtor)(a, state.b);
                CLOSURE_DTORS.unregister(state);
            } else {
                state.a = a;
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

const __wbg_adapter_22 = (arg0, arg1, arg2) => getWasm().closure30_externref_shim(arg0, arg1, arg2);

export const canvasListeners = {};

const mockWindow = {
    document: {
        body: {},
        currentScript: {}
    }
}

const element = {
    textContent: ''
};

let iter = 5;

// the mock implementation of all the imports passed to the wasm
export const imports = {
    wbg: {
        __wbg_addEventListener_90e553fdce254421: (_target, arg1, arg2, callback) => {
            const event = getStringFromWasm(arg1, arg2);
            canvasListeners[event] = callback;
        },
        __wbg_appendChild_8204974b7328bf98: () => {
            // console.log('__wbg_appendChild_8204974b7328bf98');
        },
        __wbg_axes_b1da727bd9ea422d: () => {
            // console.log('__wbg_axes_b1da727bd9ea422d');
        },
        __wbg_body_942ea927546a04ba: (...args) => {
            // console.log('__wbg_body_942ea927546a04ba');
            return addToExternrefTable(args[0].body);
        },
        __wbg_call_672a4d21634d4a24: () => {
            // console.trace('__wbg_call_672a4d21634d4a24', args);
        },
        __wbg_childNodes_c4423003f3a9441f: () => {
            return [];
        },
        __wbg_createElement_8c9931a732ee2fea: () => {
            // console.log('__wbg_createElement_8c9931a732ee2fea', getStringFromWasm(args[1], args[2]));
            return element;
        },
        __wbg_document_d249400bd7bd996d: () => {
            // console.log('__wbg_document_d249400bd7bd996d');
            return addToExternrefTable(mockWindow.document);
        },
        __wbg_from_2a5d3e218e67aa85: (...args) => {
            return Array.from(args[0]);
        },
        __wbg_getElementById_f827f0d6648718a8: () => {
            return addToExternrefTable({});
        },
        __wbg_getGamepads_1f997cef580c9088: (...args) => {
            return args[0].getGamepads();
        },
        __wbg_get_67b2ba62fc30de12: (...args) => {
            return Reflect.get(args[0], args[1]);
        },
        __wbg_get_b9b93047fe3cf45b: (...args) => {
            return args[0][args[1] >>> 0];
        },
        __wbg_instanceof_Gamepad_365ec8404255ce00: () => {
            return true;
        },
        __wbg_instanceof_HtmlCanvasElement_2ea67072a7624ac5: () => {
            return true;
        },
        __wbg_instanceof_Window_def73ea0955fc569: () => {
            // console.log('__wbg_instanceof_Window_def73ea0955fc569');
            return true;
        },
        __wbg_isTrusted_cc994b7949c53593: () => {
            return true;
        },
        __wbg_item_8be407c958853a13: (...args) => {
            const ret = args[0][args[1] >>> 0];
            return addToExternrefTable(ret);
        },
        __wbg_length_49b2ba67f0897e97: () => {
            iter--;
            return iter <= 0 ? 0 : iter;
        },
        __wbg_length_e2d2a49132c1b256: (...args) => {
            return args[0].length;
        },
        __wbg_movementX_1aa05f864931369b: (...args) => {
            return args[0].movementX;
        },
        __wbg_movementY_8acfedb38a70e624: (...args) => {
            return args[0].movementY;
        },
        __wbg_navigator_1577371c070c8947: (...args) => {
            return args[0].navigator;
        },
        __wbg_new_405e22f390576ce2: () => {
            return new Object();
        },
        __wbg_newnoargs_105ed471475aaf50: () => {
            // console.trace('__wbg_newnoargs_105ed471475aaf50');
        },
        __wbg_nodeType_5e1153141daac26a: () => {
            return 3; // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
        },
        __wbg_now_807e54c39636c349: () => {
            // console.log('__wbg_now_807e54c39636c349');
            return dateToUse || Date.now();
        },
        __wbg_set_bb8cecf6a62b9f46: (...args) => {
            return Reflect.set(args[0], args[1], args[2]);
        },
        __wbg_settextContent_d29397f7b994d314: async (...args) => {
            // console.log('__wbg_settextContent_d29397f7b994d314');
            element.textContent = getStringFromWasm(args[1], args[2]);
            jsResolve?.(element.textContent);
        },
        __wbg_static_accessor_GLOBAL_88a902d13a557d07: () => {
            // console.trace('__wbg_static_accessor_GLOBAL_88a902d13a557d07', args);
        },
        __wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0: () => {
            // console.trace('__wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0', args);
        },
        __wbg_static_accessor_SELF_37c5d418e4bf5819: () => {
            // console.log('__wbg_static_accessor_SELF_37c5d418e4bf5819');
            return addToExternrefTable(mockWindow);
        },
        __wbg_static_accessor_WINDOW_5de37043a91a9c40: () => {
            // console.trace('__wbg_static_accessor_WINDOW_5de37043a91a9c40', args);
        },
        __wbg_textContent_215d0f87d539368a: (outPtr, targetElement) => {
            const [ptr, len] = passStringToWasm(targetElement === element ? element.textContent : 'Blue Wizard Digital');
            const dv = new DataView(getWasm().memory.buffer);
            dv.setInt32(outPtr + 4 * 1, len, true);
            dv.setInt32(outPtr + 4 * 0, ptr, true);
        },
        __wbindgen_debug_string: () => {
            // console.trace('__wbindgen_debug_string', args);
        },
        __wbindgen_init_externref_table: () => {
            // console.trace('__wbindgen_init_externref_table', args);
        },
        __wbindgen_throw: () => {
            // console.trace('__wbindgen_throw', args);
        },
        __wbindgen_number_new: (arg0) => {
            return arg0;
        },
        __wbindgen_string_new: (arg0, arg1) => {
            return getStringFromWasm(arg0, arg1);
        },
        __wbindgen_string_get: (arg0, arg1) => {
            const str = getStringFromWasm(arg0, arg1);
            const [ptr, len] = passStringToWasm(str);
            const dv = new DataView(getWasm().memory.buffer);
            dv.setInt32(arg0 + 4 * 1, len, true);
            dv.setInt32(arg0 + 4 * 0, ptr, true);
        },
        __wbindgen_is_undefined: (arg0) => {
            return arg0 === undefined ? 1 : 0;
        },
        __wbindgen_boolean_get: (arg0) => {
            const v = arg0;
            const ret = typeof (v) === 'boolean' ? (v ? 1 : 0) : 2;
            return ret;
        },
        __wbindgen_closure_wrapper100: (arg0, arg1) => {
            return makeMutClosure(arg0, arg1, 31, __wbg_adapter_22);
        },
        __wbindgen_closure_wrapper99: (arg0, arg1) => {
            return makeMutClosure(arg0, arg1, 31, __wbg_adapter_22);
        },
        /*imports.wbg.__wbindgen_number_get = function (arg0, arg1) {
            const obj = arg1;
            const ret = typeof (obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        };*/
        __wbindgen_number_get: (arg0, arg1) => {
            const obj = arg1;
            const ret = typeof (obj) === 'number' ? obj : undefined;
            const dv = new DataView(getWasm().memory.buffer);
            dv.setFloat64(arg0 + 8 * 1, ret, true);
            dv.setInt32(arg0 + 4 * 0, 1, true);
        }
    }
}