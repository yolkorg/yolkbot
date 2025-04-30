export interface HousePromoItem {
    imageExt: string;
    link?: string[];
    label: string;
    active: boolean;
    id: string;
    weighted: boolean;
    hideOnCG: boolean;
    linksTo: string;
    linksToVipStore?: string;
    linksToTaggedItems?: string;
    linksToCreateGame?: string;
    linkToTwitch?: string;
}

export interface HousePromoAd {
    ad: string;
    weighted: number;
}

export interface ShellLogo {
    imageExt: string;
    label: string;
    active: boolean;
    id: string;
    weighted: boolean;
    hideOnCG: boolean;
}

export interface HousePromo {
    big: HousePromoItem[];
    small: HousePromoItem[];
    bigBanner: HousePromoItem[];
    houseAdPercentChance: number;
    specialItemsTag: string;
    featuredSocialMedia: string;
    premFeatured: string;
    smHouseAds: HousePromoAd[];
    shellLogo: ShellLogo[];
}