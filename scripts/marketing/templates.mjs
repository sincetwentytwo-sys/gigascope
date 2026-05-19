// Pure-function tweet templates. Each returns { text, suggestedImage, url }
// All text strings stay under 270 chars to leave room for link expansion.

const SITE_URL = "https://gigascope-ten.vercel.app";

function withUtm(url, campaign) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}utm_source=x&utm_medium=social&utm_campaign=${campaign}`;
}

function siteUrl(slug, campaign) {
  return withUtm(`${SITE_URL}/site/${slug}`, campaign);
}

function homeUrl(campaign) {
  return withUtm(SITE_URL, campaign);
}

function ogUrl(slug) {
  return `${SITE_URL}/site/${slug}/opengraph-image`;
}

export const templates = {
  milestoneHit({ site, milestoneText }) {
    return {
      text: `${site.flag} ${site.name} just hit a milestone:\n\n"${milestoneText}"\n\nCurrent progress: ${site.progress}%`,
      url: siteUrl(site.slug, "milestone"),
      image: ogUrl(site.slug),
      tag: "milestone",
    };
  },

  progressJump({ site, oldProgress, newProgress }) {
    const delta = newProgress - oldProgress;
    return {
      text: `${site.flag} ${site.name}: ${oldProgress}% → ${newProgress}% (+${delta}%)\n\n${site.aka}`,
      url: siteUrl(site.slug, "progress"),
      image: ogUrl(site.slug),
      tag: "progress",
    };
  },

  launchImminent({ launchName, hoursAway, launchPad }) {
    return {
      text: `🚀 T-${hoursAway}h: ${launchName}\n\nPad: ${launchPad}\n\nTrack the site:`,
      url: homeUrl("launch-t24"),
      tag: "launch-imminent",
    };
  },

  launchT1h({ launchName, launchPad }) {
    return {
      text: `🔴 LIVE in ~1 hour\n\n${launchName} — ${launchPad}\n\nWatch your spot on the empire map:`,
      url: homeUrl("launch-t1"),
      tag: "launch-t1h",
    };
  },

  launchSuccess({ launchName, launchDate, launchPad }) {
    return {
      text: `✅ ${launchName} — launched ${launchDate} from ${launchPad}.\n\nSpaceX tally just ticked up. Live count:`,
      url: homeUrl("launch-success"),
      tag: "launch-success",
    };
  },

  spacexStats({ totalLaunches, launchesThisYear, starlinkCount, year }) {
    return {
      text: `SpaceX by the numbers (live):\n\n🚀 ${totalLaunches} total launches\n📅 ${launchesThisYear} in ${year}\n🛰️ ${starlinkCount.toLocaleString()} Starlinks in orbit\n\nTrack every pad:`,
      url: homeUrl("stats-spacex"),
      tag: "stats-spacex",
    };
  },

  weeklySummary({ completedThisWeek, upcomingNextWeek }) {
    const lines = [];
    lines.push("📊 This week in the Musk Empire");
    lines.push("");
    if (completedThisWeek.length > 0) {
      lines.push(`✅ ${completedThisWeek.length} milestone${completedThisWeek.length > 1 ? "s" : ""} completed`);
    }
    if (upcomingNextWeek.length > 0) {
      lines.push(`🔜 ${upcomingNextWeek.length} upcoming`);
    }
    lines.push("");
    lines.push("Full breakdown:");
    return {
      text: lines.join("\n"),
      url: withUtm(`${SITE_URL}/timeline`, "weekly-summary"),
      tag: "weekly-summary",
    };
  },

  featuredSite({ site }) {
    return {
      text: `Spotlight: ${site.flag} ${site.name}\n\n${site.aka}\n\n📍 ${site.location}\n🏗️ ${site.progress}% — ${site.status}\n💰 ${site.investment}`,
      url: siteUrl(site.slug, "featured"),
      image: ogUrl(site.slug),
      tag: "featured",
    };
  },

  satelliteCompare({ site }) {
    return {
      text: `Then vs now: ${site.flag} ${site.name}\n\nDrag the slider — 2023 (Sentinel-2) vs latest (ESRI):`,
      url: withUtm(`${SITE_URL}/compare`, "compare"),
      tag: "compare",
    };
  },

  empireSnapshot({ totalSites, totalInvestment, companies }) {
    return {
      text: `🌍 Musk Empire — live snapshot\n\n📍 ${totalSites} sites tracked\n💰 ${totalInvestment} invested\n🏢 ${companies.length} companies: ${companies.join(", ")}\n\nExplore:`,
      url: homeUrl("snapshot"),
      tag: "snapshot",
    };
  },
};

// Format a tweet object into the markdown draft block
export function renderTweet(tweet) {
  const chars = tweet.text.length;
  const fullText = `${tweet.text}\n\n${tweet.url}`;
  const fullChars = fullText.length;
  const lines = [];
  lines.push(`### ${tweet.tag}`);
  lines.push("");
  lines.push("```");
  lines.push(fullText);
  lines.push("```");
  lines.push("");
  lines.push(`- chars (body): ${chars}/270`);
  lines.push(`- chars (with link): ~${fullChars}/280 (link counts as 23)`);
  if (tweet.image) {
    lines.push(`- suggested image: ${tweet.image}`);
  }
  lines.push("");
  return lines.join("\n");
}
