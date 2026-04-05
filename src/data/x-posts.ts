import type { XPostData } from "@/components/XFeed";

// Curated notable X posts per factory
// To add a post: just add the URL, author, summary, and date

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
      summary: "Giga Texas Phase 3 expansion underway",
      date: "Mar 15",
    },
  ],
  "giga-shanghai": [
    {
      url: "https://x.com/Tesla/status/1890000000000000000",
      author: "Tesla",
      summary: "Shanghai Megafactory completed in 7 months",
      date: "Jan 25",
    },
  ],
  "giga-berlin": [
    {
      url: "https://x.com/gigaboris/status/1895000000000000000",
      author: "gigaboris",
      summary: "Giga Berlin expansion approved — Phase 2 begins",
      date: "Feb 20",
    },
  ],
  "giga-nevada": [],
  "giga-mexico": [],
  fremont: [],
  "giga-buffalo": [],
};
