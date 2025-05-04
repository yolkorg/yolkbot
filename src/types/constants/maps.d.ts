export interface Map {
    filename: string;
    hash: string;
    name: string;
    modes: {
        FFA: boolean;
        Teams: boolean;
        Spatula: boolean;
        King?: boolean;
    };
    availability: 'public' | 'private' | 'both';
    numPlayers: string;
}

export interface MapJSON {
    fileVersion: number;
    sun: {
        direction: {
            x: number;
            y: number;
            z: number;
        }
        color: string;
    };
    ambient: string;
    fog: {
        density: string;
        color: string;
    };
    data: {
        [type: string]: {
            x: number;
            y: number;
            z: number;
            rx?: number;
            ry?: number;
            rz?: number;
        }
    };
    palette: string[];
    render: {
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
    width: number;
    height: number;
    depth: number;
    name: string;
    surfaceArea: number;
    extents: {
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
    skybox: 'default' | 'moonbase' | 'night' | 'whimsical';
    modes: {
        FFA: boolean;
        Teams: boolean;
        Spatula: boolean;
        King?: boolean;
    }
    availability: 'public' | 'private' | 'both';
    numPlayers: string;
}

export const Maps: Map[];