export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  lat: number;
  lng: number;
  description?: string;
  wikipediaUrl?: string;
  wikipediaExtract?: string;
  imageUrl?: string;
  tags?: string[];
  address?: string;
  openingHours?: string;
}

export type PlaceType = 
  | 'historic'
  | 'museum'
  | 'landmark'
  | 'nature'
  | 'park'
  | 'viewpoint'
  | 'restaurant'
  | 'cafe'
  | 'entertainment'
  | 'religious'
  | 'monument'
  | 'artwork'
  | 'other';

export interface SearchFilters {
  types: PlaceType[];
  radius: number; // in meters
  query: string;
}

export interface MapViewState {
  center: [number, number];
  zoom: number;
}

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  historic: 'Historic',
  museum: 'Museum',
  landmark: 'Landmark',
  nature: 'Nature',
  park: 'Park',
  viewpoint: 'Viewpoint',
  restaurant: 'Restaurant',
  cafe: 'Café',
  entertainment: 'Entertainment',
  religious: 'Religious',
  monument: 'Monument',
  artwork: 'Artwork',
  other: 'Other',
};

export const PLACE_TYPE_ICONS: Record<PlaceType, string> = {
  historic: '🏛️',
  museum: '🖼️',
  landmark: '📍',
  nature: '🌲',
  park: '🌳',
  viewpoint: '👁️',
  restaurant: '🍽️',
  cafe: '☕',
  entertainment: '🎭',
  religious: '⛪',
  monument: '🗿',
  artwork: '🎨',
  other: '📌',
};
