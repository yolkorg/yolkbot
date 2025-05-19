/* eslint-disable arrow-body-style */
/* eslint-disable camelcase */
/* eslint-disable no-empty-function */

// thx to https://github.com/zastlx/shell-wasm-node <3
// zastix is very amazing <3

import { getWasm, jsResolve } from './wrapper.js';
import { addToExternrefTable, getStringFromWasm, passStringToWasm } from './utils.js';

const mockWindow = {
    queueMicrotask: () => { },
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
            return new Proxy({}, {
                get: (target, prop) => {
                    if (prop.toString().includes('toPrim')) { // Symbol.toPrimitive
                        return (hint) => {
                            if (hint === 'number') return 1; // magic number seems to be required
                        }
                    }
                },
                set: (target, prop, value) => {
                    target[prop] = value;
                    return true;
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
            // console.log('__wbg_length_49b2ba67f0897e97', args);
            return 1; // have the loop fire the least amount of times as possible for best efficiency
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
            return [{}]
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
        __wbg_textContent_215d0f87d539368a: (outPtr, elm) => {
            // console.log('__wbg_textContent_215d0f87d539368a', outPtr);
            const [ptr, len] = passStringToWasm(elm === element ? element.textContent : 'Shell Shockers and our partners');

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
        __wbindgen_is_undefined: (...args) => {
            // console.log('__wbindgen_is_undefined');
            return args[0] === undefined;
        },
        __wbindgen_throw: () => {
            // console.trace('__wbindgen_throw', args);
        }
    }
}