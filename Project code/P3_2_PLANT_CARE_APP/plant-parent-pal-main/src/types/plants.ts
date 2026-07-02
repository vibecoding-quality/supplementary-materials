export interface PlantSpecies {
  id: string;
  name: string;
  scientific_name: string | null;
  description: string | null;
  watering_frequency_days: number;
  fertilizing_frequency_days: number | null;
  light_requirement: string;
  min_temperature: number | null;
  max_temperature: number | null;
  humidity_preference: string | null;
  image_url: string | null;
  care_tips: string | null;
  toxic_to_cats: boolean | null;
  toxic_to_dogs: boolean | null;
  created_at: string;
}

export interface UserPlant {
  id: string;
  user_id: string;
  species_id: string | null;
  custom_name: string | null;
  nickname: string | null;
  location: string | null;
  light_condition: string | null;
  is_heated_room: boolean | null;
  room_temperature: number | null;
  min_room_temperature: number | null;
  max_room_temperature: number | null;
  pets: string[] | null;
  notes: string | null;
  image_url: string | null;
  last_watered_at: string | null;
  last_fertilized_at: string | null;
  last_repotted_at: string | null;
  acquired_date: string | null;
  created_at: string;
  updated_at: string;
  plant_species?: PlantSpecies | null;
}

export interface CareLog {
  id: string;
  user_plant_id: string;
  user_id: string;
  care_type: string;
  notes: string | null;
  performed_at: string;
  created_at: string;
}

export type CareType = 'water' | 'fertilize' | 'repot' | 'trim' | 'rotate' | 'clean';

export type PetType = 'cat' | 'dog' | 'bird' | 'rabbit' | 'hamster' | 'fish';

export interface CareReminder {
  plant: UserPlant;
  careType: CareType;
  dueDate: Date;
  overdue: boolean;
  daysOverdue: number;
}

// Plant emoji mapping for species without images
export const plantEmojis: Record<string, string> = {
  'Monstera Deliciosa': '🪴',
  'Pothos': '🌿',
  'Snake Plant': '🌵',
  'Spider Plant': '🕷️🌱',
  'Peace Lily': '🌸',
  'Rubber Plant': '🌳',
  'Fiddle Leaf Fig': '🎻🌿',
  'ZZ Plant': '✨🌿',
  'Philodendron': '💚',
  'Aloe Vera': '🌵',
  'Boston Fern': '🌿',
  'English Ivy': '🍀',
  'Chinese Evergreen': '🌿',
  'Dracaena': '🌴',
  'Calathea': '🎨🌿',
  'Jade Plant': '💎🌱',
  'String of Pearls': '📿',
  'Bird of Paradise': '🦜🌺',
  'Croton': '🌈🌿',
  'Parlor Palm': '🌴',
  'Anthurium': '❤️🌿',
  'Orchid': '🌸',
  'African Violet': '💜🌸',
  'Begonia': '🌺',
  'Hoya': '⭐🌿',
  'Prayer Plant': '🙏🌿',
  'Peperomia': '🍃',
  'Dieffenbachia': '🌿',
  'Schefflera': '☂️🌿',
  'Norfolk Island Pine': '🌲',
  'Air Plant': '💨🌱',
  'Bromeliad': '🍍',
  'Cast Iron Plant': '🦾🌿',
  'Yucca': '⚔️🌿',
  'Polka Dot Plant': '🔴🌿',
  'Lipstick Plant': '💄🌿',
  'Oxalis': '☘️',
  'Cyclamen': '💗🌸',
  'Nerve Plant': '🧠🌿',
  'Arrowhead Plant': '➡️🌿',
  'Money Tree': '💰🌳',
  'Ponytail Palm': '💇🌴',
  'Coffee Plant': '☕🌿',
  'Banana Plant': '🍌',
  'Elephant Ear': '🐘🌿',
  'String of Hearts': '💕',
  'Tradescantia': '💜🌿',
  'Cactus': '🌵',
  'Echeveria': '🌸🌵',
  'Asparagus Fern': '🌿'
};
