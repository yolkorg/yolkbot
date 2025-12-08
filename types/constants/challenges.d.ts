export interface Challenge {
    id: number;
    loc_ref: string;
    type: number;
    subType: number;
    period: number;
    goal: number;
    reward: number;
    conditional: number;
    value: string;
    valueTwo: string | null;
    tier: number;
    loc: {
        title: string;
        desc: string;
    }
}

export const Challenges: Challenge[];