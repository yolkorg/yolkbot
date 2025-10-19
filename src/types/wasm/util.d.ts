export interface MovementXY {
    movementX: number;
    movementY: number;
}

export declare const sensitivity: number;

export declare const normalizeYaw: (yaw: number) => number;
export declare const calculateMovements: (currentYaw: number, currentPitch: number, targetYaw: number, targetPitch: number) => MovementXY;