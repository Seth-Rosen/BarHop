export interface LocationSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface MapState {
  isVisible: boolean;
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
}
