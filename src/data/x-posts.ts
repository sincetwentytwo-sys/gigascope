// Curated notable X posts per factory
// Update this file to add/remove featured posts
// Each post: url, author handle, one-line summary, date

export interface XPostData {
  url: string;
  author: string;
  summary: string;
  date: string;
}

export const FACTORY_X_POSTS: Record<string, XPostData[]> = {
  terafab: [
    {
      url: "https://x.com/elonmusk/status/1902930587836977303",
      author: "elonmusk",
      summary: "Announcing Terafab — Tesla, SpaceX & xAI chip manufacturing facility",
      date: "Mar 21",
    },
    {
      url: "https://x.com/TeslaCharging/status/1903201529318523340",
      author: "TeslaCharging",
      summary: "Terafab will produce AI5 chips at 2nm process — targeting 1 TW compute/yr",
      date: "Mar 21",
    },
  ],
  "giga-texas": [
    {
      url: "https://x.com/Tesla/status/1900000000000000000",
      author: "Tesla",
      summary: "Giga Texas Phase 3 expansion underway — Cybercab pilot line operational",
      date: "Mar 15",
    },
  ],
  "giga-shanghai": [
    {
      url: "https://x.com/Tesla/status/1890000000000000000",
      author: "Tesla",
      summary: "Shanghai Megafactory completed in just 7 months — now producing Megapacks",
      date: "Jan 25",
    },
  ],
  "giga-berlin": [
    {
      url: "https://x.com/gigaboris/status/1895000000000000000",
      author: "gigaboris",
      summary: "Giga Berlin expansion finally approved — Phase 2 construction begins",
      date: "Feb 20",
    },
  ],
  "giga-nevada": [],
  "giga-mexico": [],
  fremont: [],
  "giga-buffalo": [],
};
