export interface MovementXY {
    movementX: number;
    movementY: number;
}

export interface GetYawPitch {
    yaw: number;
    pitch: number;
    coords: string;
}

export interface CustomExports extends WebAssembly.Exports {
    memory: WebAssembly.Memory;

    start: () => void;
    process: (ptr: number, len: number) => void;
    validate(ptr: number, len: number): [number, number];
    get_yaw_pitch(): GetYawPitch;
    reset_yaw_pitch(): void;
    set_mouse_params(speed: number, invert: number, fov: number, scoped: boolean, uniqueIdPtr: string, uniqueIdLen: string): void;
    poll_gamepad(gp_idx: number, deadzone: number, speed: number, scoped: boolean, invert: number, players: object[], babylonCamera: any, selfId: number, selfTeam: number): void;

    __wbindgen_export_2: WebAssembly.Table;
    __wbindgen_export_5: WebAssembly.Table;

    __wbindgen_exn_store(idx: number): void;
    __externref_table_alloc(): number;
    __wbindgen_malloc(size: number, tag: number): number;
    __wbindgen_realloc: (ptr: number, oldSize: number, newSize: number, tag: number) => number;
    __wbindgen_free(ptr: number, size: number, tag: number): void;
    __wbindgen_start: () => void;
}

export class WASM {
    wasm: CustomExports;

    canvasListeners: {
        pointermove?: (event: MovementXY) => void;
        gamepadconnected?: (event: { gamepad: Gamepad }) => void;
    };

    mockElement: {
        textContent: string;
    }

    processDate: number | null;
    processListeners: Array<(result: string) => void>;

    initWasm(): Promise<void>;

    getStringFromWasm(ptr: number, len: number): string;
    passStringToWasm(str: string): [number, number];
    addToExternrefTable(obj: any): number;

    getImports(): WebAssembly.Imports;

    process(string: string, customDate?: number): Promise<string>;
    validate(string: string): string;
    getYawPitch(): GetYawPitch;
    resetYawPitch(): void;
    coords(yaw: number, pitch: number): string;
}

export default WASM;