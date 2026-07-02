// Curated collection of beautiful Wikipedia/Wikimedia Commons images
// All images are from Wikimedia Commons (public domain or CC licensed)

export interface WikiImage {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  connections: string[]; // IDs of related images you can walk to
}

export const wikiImages: WikiImage[] = [
  {
    id: "starry-night",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
    title: "The Starry Night",
    description: "Vincent van Gogh's iconic 1889 masterpiece depicting a swirling night sky",
    category: "Art",
    connections: ["great-wave", "mona-lisa", "nebula"]
  },
  {
    id: "great-wave",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1280px-Tsunami_by_hokusai_19th_century.jpg",
    title: "The Great Wave",
    description: "Katsushika Hokusai's famous woodblock print from 1831",
    category: "Art",
    connections: ["starry-night", "mount-fuji", "coral-reef"]
  },
  {
    id: "mona-lisa",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
    title: "Mona Lisa",
    description: "Leonardo da Vinci's enigmatic portrait from the early 16th century",
    category: "Art",
    connections: ["starry-night", "sistine-chapel", "vitruvian-man"]
  },
  {
    id: "nebula",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg/1280px-Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg",
    title: "Pillars of Creation",
    description: "Stunning Hubble image of elephant trunks of interstellar gas and dust",
    category: "Space",
    connections: ["starry-night", "galaxy", "earth-from-space"]
  },
  {
    id: "galaxy",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/M101_hires_STScI-PRC2006-10a.jpg/1280px-M101_hires_STScI-PRC2006-10a.jpg",
    title: "Pinwheel Galaxy",
    description: "The beautiful M101 spiral galaxy, 21 million light-years away",
    category: "Space",
    connections: ["nebula", "earth-from-space", "aurora"]
  },
  {
    id: "earth-from-space",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/1024px-The_Blue_Marble_%28remastered%29.jpg",
    title: "The Blue Marble",
    description: "Iconic photograph of Earth taken by Apollo 17 astronauts in 1972",
    category: "Space",
    connections: ["nebula", "galaxy", "aurora", "mount-everest"]
  },
  {
    id: "aurora",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Polarlicht_2.jpg/1280px-Polarlicht_2.jpg",
    title: "Northern Lights",
    description: "Spectacular aurora borealis dancing across the night sky",
    category: "Nature",
    connections: ["galaxy", "earth-from-space", "iceland-waterfall"]
  },
  {
    id: "mount-fuji",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/080103_hakridge_fuji.jpg/1280px-080103_hakridge_fuji.jpg",
    title: "Mount Fuji",
    description: "Japan's iconic stratovolcano and cultural symbol",
    category: "Nature",
    connections: ["great-wave", "mount-everest", "cherry-blossom"]
  },
  {
    id: "mount-everest",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Everest_North_Face_toward_Base_Camp_Tibet_Luca_Galuzzi_2006.jpg/1280px-Everest_North_Face_toward_Base_Camp_Tibet_Luca_Galuzzi_2006.jpg",
    title: "Mount Everest",
    description: "Earth's highest mountain above sea level at 8,849 meters",
    category: "Nature",
    connections: ["mount-fuji", "earth-from-space", "grand-canyon"]
  },
  {
    id: "grand-canyon",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Dawn_on_the_S_rim_of_the_Grand_Canyon_%288645178272%29.jpg/1280px-Dawn_on_the_S_rim_of_the_Grand_Canyon_%288645178272%29.jpg",
    title: "Grand Canyon",
    description: "Arizona's magnificent canyon carved by the Colorado River",
    category: "Nature",
    connections: ["mount-everest", "iceland-waterfall", "coral-reef"]
  },
  {
    id: "iceland-waterfall",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Seljalandsfoss%2C_Su%C3%B0urland%2C_Islandia%2C_2014-08-16%2C_DD_201-203_HDR.JPG/1280px-Seljalandsfoss%2C_Su%C3%B0urland%2C_Islandia%2C_2014-08-16%2C_DD_201-203_HDR.JPG",
    title: "Seljalandsfoss",
    description: "Iceland's stunning waterfall where you can walk behind the cascade",
    category: "Nature",
    connections: ["aurora", "grand-canyon", "coral-reef"]
  },
  {
    id: "coral-reef",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Coral_reef_at_palmyra.jpg/1280px-Coral_reef_at_palmyra.jpg",
    title: "Coral Reef",
    description: "Vibrant underwater ecosystem teeming with marine life",
    category: "Nature",
    connections: ["great-wave", "iceland-waterfall", "tiger"]
  },
  {
    id: "tiger",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Walking_tiger_female.jpg/1280px-Walking_tiger_female.jpg",
    title: "Bengal Tiger",
    description: "Majestic wild tiger, one of nature's most beautiful predators",
    category: "Wildlife",
    connections: ["coral-reef", "elephant", "owl"]
  },
  {
    id: "elephant",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/African_Bush_Elephant.jpg/1280px-African_Bush_Elephant.jpg",
    title: "African Elephant",
    description: "Earth's largest land animal in its natural habitat",
    category: "Wildlife",
    connections: ["tiger", "owl", "cherry-blossom"]
  },
  {
    id: "owl",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Bubo_virginianus_06.jpg/1024px-Bubo_virginianus_06.jpg",
    title: "Great Horned Owl",
    description: "Wise nocturnal predator with piercing golden eyes",
    category: "Wildlife",
    connections: ["tiger", "elephant", "aurora"]
  },
  {
    id: "cherry-blossom",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/24_Sumida_Park_2023.jpg/1280px-24_Sumida_Park_2023.jpg",
    title: "Cherry Blossoms",
    description: "Delicate sakura flowers symbolizing spring in Japan",
    category: "Nature",
    connections: ["mount-fuji", "elephant", "sistine-chapel"]
  },
  {
    id: "sistine-chapel",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/1280px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
    title: "Creation of Adam",
    description: "Michelangelo's iconic fresco from the Sistine Chapel ceiling",
    category: "Art",
    connections: ["mona-lisa", "cherry-blossom", "vitruvian-man"]
  },
  {
    id: "vitruvian-man",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Da_Vinci_Vitruve_Luc_Viatour.jpg/1024px-Da_Vinci_Vitruve_Luc_Viatour.jpg",
    title: "Vitruvian Man",
    description: "Leonardo da Vinci's study of ideal human proportions",
    category: "Art",
    connections: ["mona-lisa", "sistine-chapel", "starry-night"]
  }
];

export const getImageById = (id: string): WikiImage | undefined => {
  return wikiImages.find(img => img.id === id);
};

export const getConnectedImages = (id: string): WikiImage[] => {
  const image = getImageById(id);
  if (!image) return [];
  return image.connections
    .map(connId => getImageById(connId))
    .filter((img): img is WikiImage => img !== undefined);
};

export const getRandomStartingImage = (): WikiImage => {
  const randomIndex = Math.floor(Math.random() * wikiImages.length);
  return wikiImages[randomIndex];
};
