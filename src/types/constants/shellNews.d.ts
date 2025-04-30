export interface ShellNewsItem {
    active: boolean;
    content: string;
    imageExt: string;
    id: string;
    elId: string;
    link?: string;
    linksToChangeLog?: string;
    linksToVipStore?: string;
}

export const ShellNews: ShellNewsItem[];