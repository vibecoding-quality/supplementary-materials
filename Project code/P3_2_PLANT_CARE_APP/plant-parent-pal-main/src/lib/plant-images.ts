// Plant image imports
import africanVioletImg from '@/assets/plants/african-violet.jpg';
import airPlantImg from '@/assets/plants/air-plant.jpg';
import aloeVeraImg from '@/assets/plants/aloe-vera.jpg';
import anthuriumImg from '@/assets/plants/anthurium.jpg';
import arrowheadPlantImg from '@/assets/plants/arrowhead-plant.jpg';
import asparagusFernImg from '@/assets/plants/asparagus-fern.jpg';
import bananaPlantImg from '@/assets/plants/banana-plant.jpg';
import begoniaImg from '@/assets/plants/begonia.jpg';
import birdOfParadiseImg from '@/assets/plants/bird-of-paradise.jpg';
import bostonFernImg from '@/assets/plants/boston-fern.jpg';
import bromeliadImg from '@/assets/plants/bromeliad.jpg';
import cactusImg from '@/assets/plants/cactus.jpg';
import calatheaImg from '@/assets/plants/calathea.jpg';
import castIronPlantImg from '@/assets/plants/cast-iron-plant.jpg';
import chineseEvergreenImg from '@/assets/plants/chinese-evergreen.jpg';
import coffeePlantImg from '@/assets/plants/coffee-plant.jpg';
import crotonImg from '@/assets/plants/croton.jpg';
import cyclamenImg from '@/assets/plants/cyclamen.jpg';
import dieffenbachiaImg from '@/assets/plants/dieffenbachia.jpg';
import dracaenaImg from '@/assets/plants/dracaena.jpg';
import echeveriaImg from '@/assets/plants/echeveria.jpg';
import elephantEarImg from '@/assets/plants/elephant-ear.jpg';
import englishIvyImg from '@/assets/plants/english-ivy.jpg';
import fiddleLeafFigImg from '@/assets/plants/fiddle-leaf-fig.jpg';
import hoyaImg from '@/assets/plants/hoya.jpg';
import jadePlantImg from '@/assets/plants/jade-plant.jpg';
import lipstickPlantImg from '@/assets/plants/lipstick-plant.jpg';
import moneyTreeImg from '@/assets/plants/money-tree.jpg';
import monsteraImg from '@/assets/plants/monstera.jpg';
import nervePlantImg from '@/assets/plants/nerve-plant.jpg';
import norfolkIslandPineImg from '@/assets/plants/norfolk-island-pine.jpg';
import orchidImg from '@/assets/plants/orchid.jpg';
import oxalisImg from '@/assets/plants/oxalis.jpg';
import parlorPalmImg from '@/assets/plants/parlor-palm.jpg';
import peaceLilyImg from '@/assets/plants/peace-lily.jpg';
import peperomiaImg from '@/assets/plants/peperomia.jpg';
import philodendronImg from '@/assets/plants/philodendron.jpg';
import polkaDotPlantImg from '@/assets/plants/polka-dot-plant.jpg';
import ponytailPalmImg from '@/assets/plants/ponytail-palm.jpg';
import pothosImg from '@/assets/plants/pothos.jpg';
import prayerPlantImg from '@/assets/plants/prayer-plant.jpg';
import rubberPlantImg from '@/assets/plants/rubber-plant.jpg';
import scheffleraImg from '@/assets/plants/schefflera.jpg';
import snakePlantImg from '@/assets/plants/snake-plant.jpg';
import spiderPlantImg from '@/assets/plants/spider-plant.jpg';
import stringOfHeartsImg from '@/assets/plants/string-of-hearts.jpg';
import stringOfPearlsImg from '@/assets/plants/string-of-pearls.jpg';
import tradescantiaImg from '@/assets/plants/tradescantia.jpg';
import yuccaImg from '@/assets/plants/yucca.jpg';
import zzPlantImg from '@/assets/plants/zz-plant.jpg';

// Map plant species names to their images
export const plantImages: Record<string, string> = {
  'African Violet': africanVioletImg,
  'Air Plant': airPlantImg,
  'Aloe Vera': aloeVeraImg,
  'Anthurium': anthuriumImg,
  'Arrowhead Plant': arrowheadPlantImg,
  'Asparagus Fern': asparagusFernImg,
  'Banana Plant': bananaPlantImg,
  'Begonia': begoniaImg,
  'Bird of Paradise': birdOfParadiseImg,
  'Boston Fern': bostonFernImg,
  'Bromeliad': bromeliadImg,
  'Cactus': cactusImg,
  'Calathea': calatheaImg,
  'Cast Iron Plant': castIronPlantImg,
  'Chinese Evergreen': chineseEvergreenImg,
  'Coffee Plant': coffeePlantImg,
  'Croton': crotonImg,
  'Cyclamen': cyclamenImg,
  'Dieffenbachia': dieffenbachiaImg,
  'Dracaena': dracaenaImg,
  'Echeveria': echeveriaImg,
  'Elephant Ear': elephantEarImg,
  'English Ivy': englishIvyImg,
  'Fiddle Leaf Fig': fiddleLeafFigImg,
  'Hoya': hoyaImg,
  'Jade Plant': jadePlantImg,
  'Lipstick Plant': lipstickPlantImg,
  'Money Tree': moneyTreeImg,
  'Monstera Deliciosa': monsteraImg,
  'Nerve Plant': nervePlantImg,
  'Norfolk Island Pine': norfolkIslandPineImg,
  'Orchid': orchidImg,
  'Oxalis': oxalisImg,
  'Parlor Palm': parlorPalmImg,
  'Peace Lily': peaceLilyImg,
  'Peperomia': peperomiaImg,
  'Philodendron': philodendronImg,
  'Polka Dot Plant': polkaDotPlantImg,
  'Ponytail Palm': ponytailPalmImg,
  'Pothos': pothosImg,
  'Prayer Plant': prayerPlantImg,
  'Rubber Plant': rubberPlantImg,
  'Schefflera': scheffleraImg,
  'Snake Plant': snakePlantImg,
  'Spider Plant': spiderPlantImg,
  'String of Hearts': stringOfHeartsImg,
  'String of Pearls': stringOfPearlsImg,
  'Tradescantia': tradescantiaImg,
  'Yucca': yuccaImg,
  'ZZ Plant': zzPlantImg,
};

// Get plant image or undefined if not available
export function getPlantImage(speciesName: string | undefined): string | undefined {
  if (!speciesName) return undefined;
  return plantImages[speciesName];
}

// Living conditions analysis
export interface LivingConditionMatch {
  condition: string;
  plantNeeds: string;
  userProvides: string;
  status: 'good' | 'warning' | 'danger';
  advice?: string;
}

export interface SeasonalAdvice {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  title: string;
  tips: string[];
  shouldMove: boolean;
  moveAdvice?: string;
}

// Analyze living conditions match between plant needs and user's environment
export function analyzeLivingConditions(
  speciesMinTemp: number | null,
  speciesMaxTemp: number | null,
  speciesLight: string,
  speciesHumidity: string | null,
  userMinTemp: number | null,
  userMaxTemp: number | null,
  userLight: string | null,
  isHeatedRoom: boolean | null
): LivingConditionMatch[] {
  const matches: LivingConditionMatch[] = [];
  
  // Temperature analysis
  const plantMinTemp = speciesMinTemp ?? 15;
  const plantMaxTemp = speciesMaxTemp ?? 25;
  const roomMinTemp = userMinTemp ?? 18;
  const roomMaxTemp = userMaxTemp ?? 24;
  
  let tempStatus: 'good' | 'warning' | 'danger' = 'good';
  let tempAdvice: string | undefined;
  
  if (roomMinTemp < plantMinTemp) {
    tempStatus = roomMinTemp < plantMinTemp - 5 ? 'danger' : 'warning';
    tempAdvice = `This plant prefers temperatures above ${plantMinTemp}°C. Consider moving to a warmer spot or adding insulation near windows in winter.`;
  } else if (roomMaxTemp > plantMaxTemp) {
    tempStatus = roomMaxTemp > plantMaxTemp + 5 ? 'danger' : 'warning';
    tempAdvice = `This plant prefers temperatures below ${plantMaxTemp}°C. Avoid placing near heaters or in direct afternoon sun.`;
  }
  
  matches.push({
    condition: 'Temperature',
    plantNeeds: `${plantMinTemp}–${plantMaxTemp}°C`,
    userProvides: `${roomMinTemp}–${roomMaxTemp}°C`,
    status: tempStatus,
    advice: tempAdvice
  });
  
  // Light analysis
  const lightLevels = ['low', 'medium', 'bright', 'direct'];
  const plantLightIndex = lightLevels.indexOf(speciesLight);
  const userLightIndex = lightLevels.indexOf(userLight || 'medium');
  
  let lightStatus: 'good' | 'warning' | 'danger' = 'good';
  let lightAdvice: string | undefined;
  
  const lightDiff = userLightIndex - plantLightIndex;
  if (lightDiff < -1) {
    lightStatus = 'danger';
    lightAdvice = `This plant needs more light. Move closer to a window or consider grow lights.`;
  } else if (lightDiff < 0) {
    lightStatus = 'warning';
    lightAdvice = `This plant would appreciate slightly more light.`;
  } else if (lightDiff > 1) {
    lightStatus = 'warning';
    lightAdvice = `This plant might get too much light. Consider moving away from direct sun or adding a sheer curtain.`;
  }
  
  const lightLabels: Record<string, string> = {
    low: 'Low light',
    medium: 'Medium light',
    bright: 'Bright indirect',
    direct: 'Direct sun'
  };
  
  matches.push({
    condition: 'Light',
    plantNeeds: lightLabels[speciesLight] || 'Medium light',
    userProvides: lightLabels[userLight || 'medium'],
    status: lightStatus,
    advice: lightAdvice
  });
  
  // Humidity analysis (simplified)
  if (speciesHumidity === 'high' && isHeatedRoom) {
    matches.push({
      condition: 'Humidity',
      plantNeeds: 'High humidity',
      userProvides: 'Heated room (typically dry)',
      status: 'warning',
      advice: 'Heated rooms are often dry. Consider misting regularly, using a pebble tray, or placing near a humidifier.'
    });
  } else {
    matches.push({
      condition: 'Humidity',
      plantNeeds: speciesHumidity ? `${speciesHumidity.charAt(0).toUpperCase() + speciesHumidity.slice(1)} humidity` : 'Medium humidity',
      userProvides: isHeatedRoom ? 'Heated room' : 'Normal room',
      status: 'good'
    });
  }
  
  return matches;
}

// Get seasonal care advice
export function getSeasonalAdvice(
  speciesMinTemp: number | null,
  speciesMaxTemp: number | null,
  speciesLight: string,
  speciesHumidity: string | null,
  isHeatedRoom: boolean | null
): SeasonalAdvice[] {
  const plantMinTemp = speciesMinTemp ?? 15;
  const needsHighHumidity = speciesHumidity === 'high';
  const needsBrightLight = speciesLight === 'bright' || speciesLight === 'direct';
  const isHeatSensitive = (speciesMaxTemp ?? 25) < 24;
  const isColdSensitive = plantMinTemp > 15;
  
  return [
    {
      season: 'spring',
      title: 'Spring Care',
      tips: [
        'Resume regular fertilizing as growth increases',
        'Check for new growth and adjust watering',
        needsBrightLight ? 'Great time to move closer to windows for more light' : 'Watch for increasing sun intensity',
        'Repot if roots are crowded'
      ],
      shouldMove: false
    },
    {
      season: 'summer',
      title: 'Summer Care',
      tips: [
        'Water more frequently as temperatures rise',
        'Fertilize regularly during active growth',
        isHeatSensitive ? '⚠️ Keep away from hot windows and direct afternoon sun' : 'Enjoys the warmth but watch for leaf burn',
        needsHighHumidity ? 'Humidity is usually good, but mist if using AC' : 'Normal humidity is fine'
      ],
      shouldMove: isHeatSensitive || (speciesLight === 'low'),
      moveAdvice: isHeatSensitive 
        ? 'Move away from south-facing windows to avoid heat stress'
        : speciesLight === 'low' 
          ? 'Move further from windows if leaves are yellowing from too much sun'
          : undefined
    },
    {
      season: 'autumn',
      title: 'Autumn Care',
      tips: [
        'Reduce fertilizing as growth slows',
        'Decrease watering frequency gradually',
        needsBrightLight ? 'Move closer to windows as daylight decreases' : 'Monitor light levels',
        'Check for pests before bringing indoors from patios'
      ],
      shouldMove: needsBrightLight,
      moveAdvice: needsBrightLight 
        ? 'Move to a brighter spot as daylight hours decrease'
        : undefined
    },
    {
      season: 'winter',
      title: 'Winter Care',
      tips: [
        'Reduce watering - most plants need less water in winter',
        'Stop fertilizing until spring',
        isColdSensitive ? '⚠️ Keep away from cold drafts and windows' : 'This plant tolerates cooler temperatures',
        needsHighHumidity ? '⚠️ Use a humidifier or mist regularly - heating dries the air' : 'Watch for dry air from heating',
        'Rotate occasionally for even light exposure'
      ],
      shouldMove: isColdSensitive,
      moveAdvice: isColdSensitive 
        ? 'Move away from cold windows and drafty doors. Keep in warmest room of the house.'
        : undefined
    }
  ];
}

// Get current season
export function getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}
