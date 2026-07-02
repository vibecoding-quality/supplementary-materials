interface WikipediaSearchResult {
  title: string;
  extract: string;
  thumbnail?: string;
  pageUrl: string;
  languageCount?: number;
  availableLanguages?: string[];
}

export type WikiLanguage = {
  code: string;
  name: string;
  nativeName: string;
};

export const SUPPORTED_LANGUAGES: WikiLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
];

export async function searchWikipedia(
  query: string,
  lat?: number,
  lng?: number,
  language: string = 'en'
): Promise<WikipediaSearchResult | null> {
  try {
    // First try geosearch if coordinates provided
    if (lat && lng) {
      const geoResult = await searchWikipediaByCoords(lat, lng, query, language);
      if (geoResult) return geoResult;
    }

    // Fall back to text search
    const searchUrl = new URL(`https://${language}.wikipedia.org/w/api.php`);
    searchUrl.searchParams.set('action', 'query');
    searchUrl.searchParams.set('format', 'json');
    searchUrl.searchParams.set('origin', '*');
    searchUrl.searchParams.set('list', 'search');
    searchUrl.searchParams.set('srsearch', query);
    searchUrl.searchParams.set('srlimit', '1');

    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();

    if (!searchData.query?.search?.length) {
      return null;
    }

    const pageTitle = searchData.query.search[0].title;
    return await getWikipediaPage(pageTitle, language);
  } catch (error) {
    console.error('Wikipedia search error:', error);
    return null;
  }
}

async function searchWikipediaByCoords(
  lat: number,
  lng: number,
  name: string,
  language: string = 'en'
): Promise<WikipediaSearchResult | null> {
  try {
    const geoUrl = new URL(`https://${language}.wikipedia.org/w/api.php`);
    geoUrl.searchParams.set('action', 'query');
    geoUrl.searchParams.set('format', 'json');
    geoUrl.searchParams.set('origin', '*');
    geoUrl.searchParams.set('list', 'geosearch');
    geoUrl.searchParams.set('gscoord', `${lat}|${lng}`);
    geoUrl.searchParams.set('gsradius', '500');
    geoUrl.searchParams.set('gslimit', '5');

    const geoResponse = await fetch(geoUrl.toString());
    const geoData = await geoResponse.json();

    if (!geoData.query?.geosearch?.length) {
      return null;
    }

    // Try to find a matching title
    const normalizedName = name.toLowerCase();
    const match = geoData.query.geosearch.find((item: any) =>
      item.title.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(item.title.toLowerCase())
    );

    const pageTitle = match?.title || geoData.query.geosearch[0].title;
    return await getWikipediaPage(pageTitle, language);
  } catch (error) {
    console.error('Wikipedia geosearch error:', error);
    return null;
  }
}

async function getWikipediaPage(title: string, language: string = 'en'): Promise<WikipediaSearchResult | null> {
  try {
    const pageUrl = new URL(`https://${language}.wikipedia.org/w/api.php`);
    pageUrl.searchParams.set('action', 'query');
    pageUrl.searchParams.set('format', 'json');
    pageUrl.searchParams.set('origin', '*');
    pageUrl.searchParams.set('titles', title);
    pageUrl.searchParams.set('prop', 'extracts|pageimages|langlinks');
    pageUrl.searchParams.set('exintro', '1');
    pageUrl.searchParams.set('explaintext', '1');
    pageUrl.searchParams.set('exsentences', '4');
    pageUrl.searchParams.set('piprop', 'thumbnail');
    pageUrl.searchParams.set('pithumbsize', '400');
    pageUrl.searchParams.set('lllimit', '100');

    const pageResponse = await fetch(pageUrl.toString());
    const pageData = await pageResponse.json();

    const pages = pageData.query?.pages;
    if (!pages) return null;

    const pageId = Object.keys(pages)[0];
    if (pageId === '-1') return null;

    const page = pages[pageId];
    
    // Count available languages
    const langLinks = page.langlinks || [];
    const availableLanguages = langLinks.map((ll: any) => ll.lang);

    return {
      title: page.title,
      extract: page.extract || '',
      thumbnail: page.thumbnail?.source,
      pageUrl: `https://${language}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
      languageCount: availableLanguages.length + 1, // +1 for current language
      availableLanguages: [language, ...availableLanguages],
    };
  } catch (error) {
    console.error('Wikipedia page fetch error:', error);
    return null;
  }
}

export async function getWikipediaExtract(
  url: string, 
  language: string = 'en'
): Promise<{ extract: string; thumbnail?: string; languageCount?: number; availableLanguages?: string[] } | null> {
  try {
    // Extract title from URL
    const urlObj = new URL(url);
    const title = decodeURIComponent(urlObj.pathname.split('/').pop() || '').replace(/_/g, ' ');
    
    // Detect language from URL
    const urlLang = urlObj.hostname.split('.')[0];
    const effectiveLang = SUPPORTED_LANGUAGES.some(l => l.code === urlLang) ? urlLang : language;
    
    const result = await getWikipediaPage(title, effectiveLang);
    if (!result) return null;

    return {
      extract: result.extract,
      thumbnail: result.thumbnail,
      languageCount: result.languageCount,
      availableLanguages: result.availableLanguages,
    };
  } catch (error) {
    console.error('Error getting Wikipedia extract:', error);
    return null;
  }
}

export async function getPlaceAge(tags: Record<string, string>): Promise<number | null> {
  // Try to extract age from OSM tags
  const startDateTags = ['start_date', 'year_built', 'construction_date', 'built'];
  
  for (const tag of startDateTags) {
    const value = tags[tag];
    if (value) {
      // Try to parse year from value
      const yearMatch = value.match(/^-?\d{1,4}/);
      if (yearMatch) {
        const year = parseInt(yearMatch[0], 10);
        const currentYear = new Date().getFullYear();
        if (year < 0) {
          // BCE date
          return currentYear - year;
        } else if (year <= currentYear) {
          return currentYear - year;
        }
      }
    }
  }
  
  return null;
}
