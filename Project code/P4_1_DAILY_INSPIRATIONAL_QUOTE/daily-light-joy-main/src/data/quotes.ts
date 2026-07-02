export interface Quote {
  text: string;
  reference: string;
}

// Quotes organized by intensity level
// Lower mood (1-3) gets most uplifting/encouraging quotes
// Medium mood (4-6) gets balanced, hopeful quotes  
// Higher mood (7-10) gets joyful, gratitude-focused quotes

export const lowMoodQuotes: Quote[] = [
  {
    text: "Come to me, all you who are weary and burdened, and I will give you rest.",
    reference: "Matthew 11:28"
  },
  {
    text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
    reference: "Philippians 4:6"
  },
  {
    text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
    reference: "Jeremiah 29:11"
  },
  {
    text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.",
    reference: "Psalm 34:18"
  },
  {
    text: "Cast all your anxiety on him because he cares for you.",
    reference: "1 Peter 5:7"
  },
  {
    text: "He gives strength to the weary and increases the power of the weak.",
    reference: "Isaiah 40:29"
  },
  {
    text: "I can do all things through Christ who strengthens me.",
    reference: "Philippians 4:13"
  },
  {
    text: "The Lord is my light and my salvation—whom shall I fear?",
    reference: "Psalm 27:1"
  },
  {
    text: "When you pass through the waters, I will be with you; and when you pass through the rivers, they will not sweep over you.",
    reference: "Isaiah 43:2"
  },
  {
    text: "Fear not, for I am with you; be not dismayed, for I am your God. I will strengthen you, yes, I will help you.",
    reference: "Isaiah 41:10"
  }
];

export const mediumMoodQuotes: Quote[] = [
  {
    text: "This is the day the Lord has made; let us rejoice and be glad in it.",
    reference: "Psalm 118:24"
  },
  {
    text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
    reference: "Joshua 1:9"
  },
  {
    text: "Trust in the Lord with all your heart and lean not on your own understanding.",
    reference: "Proverbs 3:5"
  },
  {
    text: "And we know that in all things God works for the good of those who love him.",
    reference: "Romans 8:28"
  },
  {
    text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.",
    reference: "Isaiah 40:31"
  },
  {
    text: "The peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
    reference: "Philippians 4:7"
  },
  {
    text: "Commit to the Lord whatever you do, and he will establish your plans.",
    reference: "Proverbs 16:3"
  },
  {
    text: "Let the morning bring me word of your unfailing love, for I have put my trust in you.",
    reference: "Psalm 143:8"
  },
  {
    text: "The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.",
    reference: "Numbers 6:24-25"
  },
  {
    text: "Delight yourself in the Lord, and he will give you the desires of your heart.",
    reference: "Psalm 37:4"
  }
];

export const highMoodQuotes: Quote[] = [
  {
    text: "Rejoice in the Lord always. I will say it again: Rejoice!",
    reference: "Philippians 4:4"
  },
  {
    text: "Give thanks to the Lord, for he is good; his love endures forever.",
    reference: "Psalm 107:1"
  },
  {
    text: "Let everything that has breath praise the Lord!",
    reference: "Psalm 150:6"
  },
  {
    text: "The joy of the Lord is your strength.",
    reference: "Nehemiah 8:10"
  },
  {
    text: "May the God of hope fill you with all joy and peace as you trust in him.",
    reference: "Romans 15:13"
  },
  {
    text: "You make known to me the path of life; you will fill me with joy in your presence.",
    reference: "Psalm 16:11"
  },
  {
    text: "Sing to the Lord a new song, for he has done marvelous things.",
    reference: "Psalm 98:1"
  },
  {
    text: "Every good and perfect gift is from above, coming down from the Father of lights.",
    reference: "James 1:17"
  },
  {
    text: "Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.",
    reference: "Matthew 5:16"
  },
  {
    text: "I have told you this so that my joy may be in you and your joy may be complete.",
    reference: "John 15:11"
  }
];

export function getQuoteForMood(mood: number): Quote {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  
  let quotes: Quote[];
  
  if (mood <= 3) {
    quotes = lowMoodQuotes;
  } else if (mood <= 6) {
    quotes = mediumMoodQuotes;
  } else {
    quotes = highMoodQuotes;
  }
  
  // Use day of year + mood to get a consistent quote for the day
  const index = (dayOfYear + mood) % quotes.length;
  return quotes[index];
}
