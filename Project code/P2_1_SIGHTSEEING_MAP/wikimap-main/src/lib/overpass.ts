import { Place, PlaceType } from '@/types/places';

// Multiple Overpass endpoints for fallback
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const OSM_TYPE_MAPPING: Record<string, PlaceType> = {
  'tourism=museum': 'museum',
  'tourism=artwork': 'artwork',
  'tourism=viewpoint': 'viewpoint',
  'historic=monument': 'monument',
  'historic=memorial': 'monument',
  'historic=castle': 'historic',
  'historic=ruins': 'historic',
  'historic=archaeological_site': 'historic',
  'historic=building': 'historic',
  'amenity=place_of_worship': 'religious',
  'amenity=theatre': 'entertainment',
  'amenity=cinema': 'entertainment',
  'amenity=restaurant': 'restaurant',
  'amenity=cafe': 'cafe',
  'leisure=park': 'park',
  'leisure=garden': 'park',
  'leisure=nature_reserve': 'nature',
  'natural=peak': 'nature',
  'natural=waterfall': 'nature',
};

function buildOverpassQuery(
  lat: number,
  lng: number,
  radius: number,
  types: PlaceType[]
): string {
  const typeFilters: string[] = [];

  if (types.length === 0 || types.includes('museum')) {
    typeFilters.push('node["tourism"="museum"]');
    typeFilters.push('way["tourism"="museum"]');
  }
  if (types.length === 0 || types.includes('historic')) {
    typeFilters.push('node["historic"]');
    typeFilters.push('way["historic"]');
  }
  if (types.length === 0 || types.includes('landmark')) {
    typeFilters.push('node["tourism"="attraction"]');
    typeFilters.push('way["tourism"="attraction"]');
  }
  if (types.length === 0 || types.includes('monument')) {
    typeFilters.push('node["historic"="monument"]');
    typeFilters.push('node["historic"="memorial"]');
  }
  if (types.length === 0 || types.includes('viewpoint')) {
    typeFilters.push('node["tourism"="viewpoint"]');
  }
  if (types.length === 0 || types.includes('religious')) {
    typeFilters.push('node["amenity"="place_of_worship"]');
    typeFilters.push('way["amenity"="place_of_worship"]');
  }
  if (types.length === 0 || types.includes('park')) {
    typeFilters.push('way["leisure"="park"]');
    typeFilters.push('way["leisure"="garden"]');
  }
  if (types.length === 0 || types.includes('nature')) {
    typeFilters.push('node["natural"="peak"]');
    typeFilters.push('node["natural"="waterfall"]');
    typeFilters.push('way["leisure"="nature_reserve"]');
  }
  if (types.length === 0 || types.includes('artwork')) {
    typeFilters.push('node["tourism"="artwork"]');
    typeFilters.push('way["tourism"="artwork"]');
  }
  if (types.length === 0 || types.includes('entertainment')) {
    typeFilters.push('node["amenity"="theatre"]');
    typeFilters.push('node["amenity"="cinema"]');
  }

  const filterString = typeFilters
    .map((f) => `${f}(around:${radius},${lat},${lng});`)
    .join('\n  ');

  return `
[out:json][timeout:25];
(
  ${filterString}
);
out body center;
`;
}

function determineType(tags: Record<string, string>): PlaceType {
  for (const [key, type] of Object.entries(OSM_TYPE_MAPPING)) {
    const [tagKey, tagValue] = key.split('=');
    if (tags[tagKey] === tagValue || (tagValue === undefined && tags[tagKey])) {
      return type;
    }
  }
  
  if (tags.historic) return 'historic';
  if (tags.tourism) return 'landmark';
  if (tags.leisure) return 'park';
  if (tags.natural) return 'nature';
  
  return 'other';
}

export async function searchPlacesNearby(
  lat: number,
  lng: number,
  radius: number = 5000,
  types: PlaceType[] = []
): Promise<Place[]> {
  const query = buildOverpassQuery(lat, lng, radius, types);

  // Try each endpoint until one works
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(endpoint, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.warn(`Overpass endpoint ${endpoint} returned ${response.status}, trying next...`);
        continue;
      }

      const data = await response.json();
    
    const places: Place[] = data.elements
      .filter((el: any) => el.tags?.name)
      .map((el: any) => {
        const placeLat = el.lat ?? el.center?.lat;
        const placeLng = el.lon ?? el.center?.lon;
        
        if (!placeLat || !placeLng) return null;

        return {
          id: `osm-${el.id}`,
          name: el.tags.name,
          type: determineType(el.tags),
          lat: placeLat,
          lng: placeLng,
          description: el.tags.description || el.tags['description:en'],
          wikipediaUrl: el.tags.wikipedia
            ? `https://en.wikipedia.org/wiki/${el.tags.wikipedia.replace(/^en:/, '')}`
            : undefined,
          tags: Object.entries(el.tags)
            .filter(([k]) => !['name', 'description'].includes(k))
            .slice(0, 5)
            .map(([k, v]) => `${k}:${v}`),
          address: el.tags['addr:street']
            ? `${el.tags['addr:housenumber'] || ''} ${el.tags['addr:street']}, ${el.tags['addr:city'] || ''}`
            : undefined,
          openingHours: el.tags.opening_hours,
        };
      })
      .filter(Boolean) as Place[];

      return places;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`Overpass endpoint ${endpoint} timed out, trying next...`);
      } else {
        console.warn(`Overpass endpoint ${endpoint} failed:`, error);
      }
      continue;
    }
  }

  console.error('All Overpass endpoints failed');
  return [];
}

export async function searchPlacesByQuery(
  query: string,
  lat?: number,
  lng?: number
): Promise<{ lat: number; lng: number; name: string }[]> {
  const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search');
  nominatimUrl.searchParams.set('q', query);
  nominatimUrl.searchParams.set('format', 'json');
  nominatimUrl.searchParams.set('limit', '5');
  
  if (lat && lng) {
    nominatimUrl.searchParams.set('viewbox', `${lng - 1},${lat + 1},${lng + 1},${lat - 1}`);
    nominatimUrl.searchParams.set('bounded', '0');
  }

  try {
    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        'User-Agent': 'AtlasMapExplorer/1.0',
      },
    });

    if (!response.ok) {
      throw new Error('Nominatim search failed');
    }

    const data = await response.json();
    
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      name: item.display_name,
    }));
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
}
