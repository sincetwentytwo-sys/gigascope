import { NextResponse } from "next/server";

// Public debug endpoint to diagnose why the Community feed is empty.
// Visit /api/x-debug to see whether the X API token is set and what the API
// actually returns. Safe to deploy: only exposes presence of token, not value.
export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.X_BEARER_TOKEN;
  const result: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    tokenPresent: Boolean(token),
    tokenLength: token?.length ?? 0,
    tokenPrefix: token ? `${token.slice(0, 8)}...` : null,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV ?? null,
  };

  if (!token) {
    result.error = "X_BEARER_TOKEN environment variable is not set on this deployment";
    return NextResponse.json(result, { status: 200 });
  }

  // Try the simplest possible query first
  const tests = [
    { name: "simple-tesla", query: "Tesla -is:retweet" },
    { name: "from-tesla", query: "from:Tesla -is:retweet" },
    { name: "from-elonmusk", query: "from:elonmusk -is:retweet" },
    { name: "official-or", query: "(from:Tesla OR from:elonmusk OR from:SpaceX) -is:retweet" },
  ];

  const testResults: Record<string, unknown>[] = [];
  for (const test of tests) {
    try {
      const params = new URLSearchParams({
        query: test.query,
        max_results: "10",
        "tweet.fields": "created_at,public_metrics,author_id",
        expansions: "author_id",
        "user.fields": "name,username",
      });
      const res = await fetch(
        `https://api.x.com/2/tweets/search/recent?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );
      const status = res.status;
      const headers: Record<string, string> = {};
      ["x-rate-limit-limit", "x-rate-limit-remaining", "x-rate-limit-reset", "content-type"].forEach((h) => {
        const v = res.headers.get(h);
        if (v) headers[h] = v;
      });

      let body: unknown;
      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        body = await res.json();
      } else {
        body = (await res.text()).slice(0, 500);
      }

      // Show only summary, not full tweet bodies
      let summary: unknown = body;
      if (body && typeof body === "object" && "data" in body) {
        const data = (body as { data?: unknown[] }).data;
        summary = {
          tweetCount: Array.isArray(data) ? data.length : 0,
          errors: (body as { errors?: unknown }).errors,
          meta: (body as { meta?: unknown }).meta,
          firstTweetText: Array.isArray(data) && data.length > 0
            ? (data[0] as { text?: string }).text?.slice(0, 100)
            : null,
        };
      }

      testResults.push({
        name: test.name,
        query: test.query,
        status,
        headers,
        summary,
      });
    } catch (err) {
      testResults.push({
        name: test.name,
        query: test.query,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  result.tests = testResults;
  return NextResponse.json(result, { status: 200 });
}
