export interface MapModes {
    FFA: boolean;
    Teams: boolean;
    Spatula: boolean;
    King?: boolean;
}

export type MapAvailability = 'public' | 'private' | 'both';

export interface Map {
    filename: string;
    hash: string;
    name: string;
    modes: MapModes;
    availability: MapAvailability;
    numPlayers: string;
}

export interface MapData {
    [type: string]: {
        x: number;
        y: number;
        z: number;
        rx?: number;
        ry?: number;
        rz?: number;
    }[];
}

export interface MapSun {
    direction: {
        x: number;
        y: number;
        z: number;
    }
    color: string;
}

export interface MapRender {
    AO?: string;
    Diffuse: string;
    Direct: string;
    Dirt: string;
    Environment?: string;
    FogDensity: string;
    Indirect: string;
    Lights?: string;
    LightsReflect?: string;
    pointLightIntensity: number;
    Reflect: string;
    Sun?: string;
    SunReflect?: string;
}

export interface MapExtents {
    x: {
        min: number;
        max: number;
    }
    y: {
        min: number;
        max: number;
    }
    z: {
        min: number;
        max: number;
    }
    width: number;
    height: number;
    depth: number;
}

export interface MapJSON {
    fileVersion: number;
    sun: MapSun;
    ambient: string;
    fog: {
        density: string;
        color: string;
    }
    data: MapData;
    palette: string[];
    render: MapRender;
    width: number;
    height: number;
    depth: number;
    name: string;
    surfaceArea: number;
    extents: MapExtents;
    skybox: 'default' | 'moonbase' | 'night' | 'whimsical';
    modes: MapModes;
    availability: MapAvailability;
    numPlayers: string;
}

export const Maps: Map[];