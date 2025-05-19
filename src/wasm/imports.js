/* eslint-disable arrow-body-style */
/* eslint-disable camelcase */
/* eslint-disable no-empty-function */

// thx to https://github.com/zastlx/shell-wasm-node <3
// zastix is very amazing <3

import { jsResolve } from './wrapper.js';
import { addToExternrefTable, getStringFromWasm, passStringToWasm } from './utils.js';

const mockWindow = {
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
        __wbg_document_d249400bd7bd996d: () => {
            // console.log('__wbg_document_d249400bd7bd996d');
            return addToExternrefTable(mockWindow.document);
        },
        __wbg_instanceof_Window_def73ea0955fc569: () => {
            // console.log('__wbg_instanceof_Window_def73ea0955fc569');
            return true;
        },
        __wbg_newnoargs_105ed471475aaf50: () => {
            // console.trace('__wbg_newnoargs_105ed471475aaf50');
        },
        __wbg_now_807e54c39636c349: () => {
            // console.log('__wbg_now_807e54c39636c349');
            return Date.now();
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