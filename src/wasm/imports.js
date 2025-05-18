/* eslint-disable arrow-body-style */
/* eslint-disable camelcase */
/* eslint-disable no-empty-function */
/* eslint-disable no-undefined */
/* eslint-disable no-underscore-dangle */
/* eslint-disable stylistic/max-len */

import { getWasm } from './wrapper.js';
import { addToExternrefTable, passStringToWasm } from './utils.js';

// only for this version so moved here
const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => { }, unregister: () => { } }
    : new FinalizationRegistry((state) => {
        getWasm().__wbindgen_export_5.get(state.dtor)(state.a, state.b)
    });

// this seems to be used to run a function in the wasm from js, e.g a callback
export const makeMutClosure = (arg0, arg1, dtor, f, wasm) => {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_5.get(state.dtor)(a, state.b);
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

const mockWindow = {
    queueMicrotask: (fn) => {
        // console.log('window.queueMicrotask called with', fn);
        // if this is not commented out it calls setTimeout and loops over all "p" elements and checks for something in the textContent of it, not sure what it's checking for. 
        // returning the js code seems to stop it from calling the set href, 
        // if you pass anything else it trys to set the href,
        // i dont know what it's checking for but it's something in the script code
        fn();
    },
    document: {
        body: {},
        currentScript: {}
    }
}

const element = {
    textContent: ''
};

// the mock implementation of all the imports passed to the wasm
export const imports = {
    wbg: {
        __wbg_appendChild_8204974b7328bf98: () => {
            // console.log('__wbg_appendChild_8204974b7328bf98');
        },
        __wbg_body_942ea927546a04ba: (...args) => {
            // console.log('__wbg_body_942ea927546a04ba');
            return addToExternrefTable(args[0].body);
        },
        __wbg_call_672a4d21634d4a24: () => {
            // console.trace('__wbg_call_672a4d21634d4a24', args);
        },
        __wbg_clearTimeout_5a54f8841c30079a: (...args) => {
            // console.log('__wbg_clearTimeout_5a54f8841c30079a');
            clearTimeout(args[0]);
        },
        __wbg_createElement_8c9931a732ee2fea: () => {
            // console.log('__wbg_createElement_8c9931a732ee2fea', getStringFromWasm(args[1], args[2]));
            return element;
        },
        __wbg_currentScript_696dfba63dbe2fbe: (...args) => {
            // console.log('__wbg_currentScript_696dfba63dbe2fbe');
            return addToExternrefTable(args[0].currentScript);
        },
        __wbg_document_d249400bd7bd996d: () => {
            // console.log('__wbg_document_d249400bd7bd996d');
            return addToExternrefTable(mockWindow.document);
        },
        __wbg_get_e27dfaeb6f46bd45: () => {
            // console.log('__wbg_get_e27dfaeb6f46bd45');
            return new Proxy({
                toString: () => 'test',
                valueOf: () => 'test'
            }, {
                get: (target, prop) => {
                    if (prop.toString().includes('Symbol')) {
                        return (hint) => {
                            if (hint === 'number') return 5;
                        }
                    }
                    return target[prop];
                }
            });
        },
        __wbg_instanceof_Element_0af65443936d5154: () => {
            // console.log('__wbg_instanceof_Element_0af65443936d5154');
            return true;
        },
        __wbg_instanceof_HtmlScriptElement_2e62e6b65dda86a4: (...args) => {
            // console.log('__wbg_instanceof_HtmlScriptElement_2e62e6b65dda86a4');
            return args[0] === mockWindow.document.currentScript;
        },
        __wbg_instanceof_Window_def73ea0955fc569: () => {
            // console.log('__wbg_instanceof_Window_def73ea0955fc569');
            return true;
        },
        __wbg_length_49b2ba67f0897e97: () => {
            // console.log('__wbg_length_49b2ba67f0897e97');
            return 132; // amount of p elements on shell without any guis, dunno if this actually matters
        },
        __wbg_location_350d99456c2f3693: () => {
            const location = {};
            return location;
        },
        __wbg_newnoargs_105ed471475aaf50: () => {
            // console.trace('__wbg_newnoargs_105ed471475aaf50');
        },
        __wbg_now_807e54c39636c349: () => {
            // console.log('__wbg_now_807e54c39636c349');
            return Date.now();
        },
        __wbg_querySelectorAll_40998fd748f057ef: () => {
            // const query = getStringFromWasm(args[1], args[2]);
            // console.log(`__wbg_querySelectorAll_40998fd748f057ef called with ${query}`);
            return [];
        },
        __wbg_queueMicrotask_97d92b4fcc8a61c5: (...args) => {
            // console.log('__wbg_queueMicrotask_97d92b4fcc8a61c5');
            mockWindow.queueMicrotask(args[0]);
        },
        __wbg_queueMicrotask_d3219def82552485: (...args) => {
            // console.log('__wbg_queueMicrotask_d3219def82552485');
            return args[0].queueMicrotask;
        },
        __wbg_resolve_4851785c9c5f573d: (...args) => {
            // console.log('__wbg_resolve_4851785c9c5f573d');
            return Promise.resolve(args[0]);
        },
        __wbg_setTimeout_db2dbaeefb6f39c7: (...args) => {
            // console.log('__wbg_setTimeout_db2dbaeefb6f39c7 with timeout', args[1]);
            return setTimeout(args[0], args[1]); // change args[1] to a lower number to have the next checks run sooner (this goes in a loop a decent amount of times before it exist) goes from the timeout being 10000ms to 30000ms finally to 60000ms and then exits.
        },
        __wbg_sethref_7eb69a6b9ae98056: () => {
            // console.log('__wbg_sethref_7eb69a6b9ae98056');
            // const targetHref = getStringFromWasm(args[1], args[2]);
            // console.log('attempted to redirect to', targetHref);
        },
        __wbg_settextContent_d29397f7b994d314: async () => {
            // console.log('__wbg_settextContent_d29397f7b994d314');
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
        __wbg_textContent_215d0f87d539368a: (outPtr) => {
            // console.log('__wbg_textContent_215d0f87d539368a');
            const [ptr, len] = passStringToWasm(element.textContent);

            const dv = new DataView(getWasm().memory.buffer);
            dv.setInt32(outPtr + 4 * 1, len, true);
            dv.setInt32(outPtr + 4 * 0, ptr, true);
        },
        __wbg_then_44b73946d2fb3e7d: () => {
            // console.trace('__wbg_then_44b73946d2fb3e7d', args);
        },
        __wbindgen_cb_drop: (...args) => {
            // console.log('__wbindgen_cb_drop');
            const obj = args[0].original;
            if (obj.cnt-- === 1) {
                obj.a = 0;
                return true;
            }

            return false;
        },
        __wbindgen_closure_wrapper281: (...args) => {
            // console.log('__wbindgen_closure_wrapper281');
            return makeMutClosure(args[0], args[1], 22, (...args2) => {
                getWasm()._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h573d6777e73915f0(args2[0], args2[1]);
            }, getWasm());
        },
        __wbindgen_closure_wrapper295: (...args3) => {
            // console.log('__wbindgen_closure_wrapper295');
            return makeMutClosure(args3[0], args3[1], 29, (...args4) => {
                getWasm().closure28_externref_shim(args4[0], args4[1], args4[2]);
            }, getWasm());
        },
        __wbindgen_debug_string: () => {
            // console.trace('__wbindgen_debug_string', args);
        },
        __wbindgen_init_externref_table: () => {
            // console.trace('__wbindgen_init_externref_table', args);
        },
        __wbindgen_is_function: (...args) => {
            // console.log('__wbindgen_is_function');
            return typeof args[0] === 'function';
        },
        __wbindgen_is_undefined: (...args) => {
            // console.log('__wbindgen_is_undefined');
            return args[0] === undefined;
        },
        __wbindgen_throw: () => {
            // console.trace('__wbindgen_throw', args);
        }
    }
}