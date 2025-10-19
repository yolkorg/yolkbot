export const sensitivity = 0.0025;

export const normalizeYaw = (yaw) => {
    while (yaw < 0) yaw += 2 * Math.PI;
    while (yaw >= 2 * Math.PI) yaw -= 2 * Math.PI;
    return yaw;
};

export const calculateMovements = (currentYaw, currentPitch, targetYaw, targetPitch) => {
    const normalizedCurrentYaw = normalizeYaw(currentYaw);
    const normalizedTargetYaw = normalizeYaw(targetYaw);

    let yawDiff = normalizedTargetYaw - normalizedCurrentYaw;
    if (Math.abs(yawDiff) > Math.PI) yawDiff = yawDiff > 0 ? yawDiff - 2 * Math.PI : yawDiff + 2 * Math.PI;

    const pitchDiff = targetPitch - currentPitch;

    const movementX = Math.round(-yawDiff / sensitivity);
    const movementY = Math.round(-pitchDiff / sensitivity);

    return { movementX, movementY };
}