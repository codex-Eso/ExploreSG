export type LocType = {
    reviewStatus: string;
    name: string;
    lat: number;
    lng: number;
    description: string;
    mapLocation?: string;
    accessibility?: { rating: number; reason: string; };
    scenery?: { rating: number; reason: string; };
    rating?: number;
    remarks?: string;
    images?: { imageUrl?: string; caption?: string; }[];
}