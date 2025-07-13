export interface GetYawPitch {
    yaw: number;
    pitch: number;
    coords: string;
}

export declare function coords(yaw: number, pitch: number): string;
export declare function getYawPitch(): GetYawPitch;
export declare function process(shellshockJS: string, dateToUse?: number): Promise<string>;
export declare function validate(uuid: string): string;