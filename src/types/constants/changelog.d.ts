export interface ChangelogEntry {
    version: string;
    date: string;
    content: string[];
}

export const Changelog: ChangelogEntry[];