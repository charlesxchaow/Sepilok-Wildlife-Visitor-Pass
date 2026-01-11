
export type AttractionType = 'ORANGUTAN' | 'SUNBEAR' | 'COMBO';

export interface Attraction {
  id: AttractionType;
  name: string;
  description: string;
  image: string;
  externalUrl?: string;
  prices: {
    adult: number;
    child: number;
  };
}

export interface BookingDetails {
  attractionId: AttractionType;
  date: string;
  timeSlot: string;
  adultCount: number;
  childCount: number;
  visitorName: string;
}
