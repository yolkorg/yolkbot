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
    availability: string;
    numPlayers: string;
}

export const Maps: Map[];