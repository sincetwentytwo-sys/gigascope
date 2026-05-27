import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type {
  RecapAnalysis,
  RecapMilestone,
  RecapUpcoming,
} from "@/lib/weeklyRecap";
import type { Company } from "@/data/types";

interface WeeklyRecapProps {
  email: string;
  weekEndingISO: string; // YYYY-MM-DD — Saturday the recap was generated
  recentlyDone: RecapMilestone[];
  recentAnalyses: RecapAnalysis[];
  upcoming: RecapUpcoming[];
}

// Per-company chip colors. Mirrors `src/data/companies.ts` so the recap
// reads as visually consistent with the site grid. Hard-coded here instead
// of imported so the email template is fully self-contained and doesn't
// drag the COMPANIES array into the cron's render path.
const COMPANY_COLOR: Record<Company, string> = {
  tesla: "#e31937",
  spacex: "#005288",
  xai: "#7b2dbd",
  neuralink: "#00875a",
  boring: "#bf5600",
  joint: "#c4a000",
};

function companyChipStyle(company: Company): Record<string, string> {
  const bg = COMPANY_COLOR[company] ?? "#666666";
  return {
    display: "inline-block",
    padding: "2px 7px",
    borderRadius: "3px",
    background: bg,
    color: "#ffffff",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    verticalAlign: "middle",
    marginRight: "6px",
  };
}

function formatDaysAway(d: number): string {
  if (d <= 0) return "today";
  if (d === 1) return "in 1 day";
  return `in ${d} days`;
}

export default function WeeklyRecapEmail({
  email,
  weekEndingISO,
  recentlyDone,
  recentAnalyses,
  upcoming,
}: WeeklyRecapProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {`Week ending ${weekEndingISO} · ${recentlyDone.length} done, ${recentAnalyses.length} analysis, ${upcoming.length} catalysts ahead`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={brand}>GIGASCOPE</Heading>
          <Text style={tagline}>
            Weekly recap — what landed, what&apos;s next.
          </Text>

          <Hr style={hr} />

          {/* What landed this week */}
          <Heading style={h2}>What landed this week</Heading>
          {recentlyDone.length === 0 ? (
            <Text style={quiet}>
              Quiet this week. The empire&apos;s not always announcing.
            </Text>
          ) : (
            <Section style={list}>
              {recentlyDone.map((m, i) => (
                <Text key={`done-${i}`} style={row}>
                  <span style={dateCell}>{m.date}</span>
                  <span style={companyChipStyle(m.company)}>{m.company}</span>
                  <Link
                    href={`https://gigascope.xyz/site/${m.siteSlug}`}
                    style={siteLink}
                  >
                    {m.siteName}
                  </Link>{" "}
                  <span style={rowText}>— {m.text}</span>
                  {m.sourceUrl ? (
                    <>
                      {" "}
                      <Link href={m.sourceUrl} style={srcLink}>
                        [source]
                      </Link>
                    </>
                  ) : null}
                </Text>
              ))}
            </Section>
          )}

          <Hr style={hrInner} />

          {/* Latest analysis */}
          <Heading style={h2}>Latest analysis</Heading>
          {recentAnalyses.length === 0 ? (
            <Text style={quiet}>
              Quiet this week. The empire&apos;s not always announcing.
            </Text>
          ) : (
            <Section style={list}>
              {recentAnalyses.map((a, i) => (
                <Text key={`analysis-${i}`} style={row}>
                  <span style={dateCell}>{a.publishedAt.slice(0, 10)}</span>
                  <span style={kicker}>{a.kicker}</span>
                  <br />
                  <Link
                    href={`https://gigascope.xyz/pulse/${a.slug}`}
                    style={analysisTitle}
                  >
                    {a.title}
                  </Link>
                </Text>
              ))}
            </Section>
          )}

          <Hr style={hrInner} />

          {/* Coming up · next 14 days */}
          <Heading style={h2}>Coming up · next 14 days</Heading>
          {upcoming.length === 0 ? (
            <Text style={quiet}>
              Quiet this week. The empire&apos;s not always announcing.
            </Text>
          ) : (
            <Section style={list}>
              {upcoming.map((u, i) => (
                <Text key={`up-${i}`} style={row}>
                  <span style={dateCell}>{u.date}</span>
                  <span style={companyChipStyle(u.company)}>{u.company}</span>
                  <Link
                    href={`https://gigascope.xyz/site/${u.siteSlug}`}
                    style={siteLink}
                  >
                    {u.siteName}
                  </Link>{" "}
                  <span style={rowText}>— {u.text}</span>{" "}
                  <span style={daysAway}>({formatDaysAway(u.daysAway)})</span>
                  {u.sourceUrl ? (
                    <>
                      {" "}
                      <Link href={u.sourceUrl} style={srcLink}>
                        [source]
                      </Link>
                    </>
                  ) : null}
                </Text>
              ))}
            </Section>
          )}

          <Hr style={hr} />

          <Text style={text}>See the full empire view:</Text>
          <Link href="https://gigascope.xyz/pulse" style={cta}>
            gigascope.xyz/pulse →
          </Link>

          <Hr style={hr} />

          <Text style={footer}>
            You signed up as {email}. Reply to this email any time.
          </Text>
          <Text style={footer}>
            GIGASCOPE — Community project. Not affiliated with Tesla, SpaceX,
            xAI, Neuralink, or The Boring Company. Not financial advice.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Helvetica, Arial, sans-serif',
  color: "#0a0a0a",
};

const container = {
  margin: "0 auto",
  padding: "40px 24px",
  maxWidth: "640px",
};

const brand = {
  color: "#0a0a0a",
  fontSize: "28px",
  fontWeight: "700",
  letterSpacing: "-0.02em",
  margin: "0 0 8px",
};

const tagline = {
  color: "#666",
  fontSize: "14px",
  margin: "0",
};

const h2 = {
  color: "#0a0a0a",
  fontSize: "14px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  fontWeight: "700",
  margin: "20px 0 10px",
};

const list = {
  margin: "0 0 8px",
};

const row = {
  color: "#0a0a0a",
  fontSize: "13px",
  lineHeight: "1.55",
  margin: "8px 0",
};

const dateCell = {
  display: "inline-block",
  fontFamily:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  fontSize: "11px",
  color: "#86868b",
  marginRight: "8px",
  minWidth: "70px",
  verticalAlign: "middle",
};

const siteLink = {
  color: "#0a0a0a",
  fontWeight: "600",
  textDecoration: "none",
};

const rowText = {
  color: "#0a0a0a",
};

const daysAway = {
  color: "#86868b",
  fontSize: "12px",
};

const srcLink = {
  color: "#0066cc",
  fontSize: "11px",
  textDecoration: "underline",
};

const analysisTitle = {
  color: "#0a0a0a",
  fontWeight: "600",
  textDecoration: "underline",
};

const kicker = {
  color: "#86868b",
  fontSize: "11px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  marginRight: "6px",
};

const quiet = {
  color: "#86868b",
  fontSize: "13px",
  fontStyle: "italic" as const,
  margin: "6px 0 12px",
};

const text = {
  color: "#0a0a0a",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "12px 0 4px",
};

const cta = {
  color: "#0a0a0a",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "underline",
};

const hr = {
  borderColor: "#e5e5e5",
  margin: "20px 0",
};

const hrInner = {
  borderColor: "#f0f0f0",
  borderTop: "1px dashed #e5e5e5",
  margin: "16px 0",
};

const footer = {
  color: "#888",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "4px 0",
};
