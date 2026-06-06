import {
  Body,
  Button,
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

// Per-site "new satellite frame landed" alert.
//
// HONESTY GUARD (do not relax — see CLAUDE.md /// 디자인 원칙):
// Cadence is Sentinel-2 ~weekly best-case + ESRI Wayback ~3-6 months,
// weather-permitting. NEVER imply real-time / daily / guaranteed.
// The "cadence varies" line on every send is a feature, not boilerplate.

interface SatelliteDropEmailProps {
  email: string;
  factoryName: string;
  slug: string;
  /** ISO YYYY-MM-DD — the newly-arrived capture date. */
  latest: string;
  /** ISO YYYY-MM-DD or null for first-seen sites. */
  previous: string | null;
  /**
   * Days between previous and latest. Infinity sentinel for first-seen —
   * rendered as "—" so we never display a misleading huge number.
   */
  daysGap: number;
}

function formatDate(iso: string): string {
  // Parse as UTC midnight so toLocaleDateString doesn't drift the day.
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  const d = new Date(Date.UTC(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10)));
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatGap(daysGap: number): string {
  if (!Number.isFinite(daysGap)) return "—";
  return `${daysGap} day${daysGap === 1 ? "" : "s"}`;
}

export default function SatelliteDropEmail({
  email,
  factoryName,
  slug,
  latest,
  previous,
  daysGap,
}: SatelliteDropEmailProps) {
  const siteUrl = `https://gigascope.xyz/site/${slug}`;
  const preview = `New ${factoryName} satellite frame · captured ${latest}`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={brand}>GIGASCOPE</Heading>
          <Text style={tagline}>
            Watch Musk&apos;s empire get built, one satellite frame at a time.
          </Text>

          <Hr style={hr} />

          <Heading style={h2}>New satellite frame · {factoryName}</Heading>

          <Text style={text}>
            A new satellite frame just landed for {factoryName}.
          </Text>

          <Section style={card}>
            <Text style={cardRow}>
              <strong>Captured:</strong> {formatDate(latest)}
            </Text>
            <Text style={cardRow}>
              <strong>Previous capture:</strong>{" "}
              {previous ? formatDate(previous) : "—"}
            </Text>
            <Text style={cardRow}>
              <strong>Gap:</strong> {formatGap(daysGap)}
            </Text>
          </Section>

          <Text style={textMuted}>
            Source: ESRI World Imagery + Sentinel-2. Cadence varies by weather
            and provider; this is not a daily feed.
          </Text>

          <Section style={{ textAlign: "center", margin: "24px 0" }}>
            <Button href={siteUrl} style={cta}>
              View site at gigascope.xyz/site/{slug}
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You signed up as {email}. Manage alerts at{" "}
            <Link href="https://gigascope.xyz/account" style={footerLink}>
              gigascope.xyz/account
            </Link>{" "}
            (coming soon), or use the unsubscribe link in the email header.
          </Text>
          <Text style={footer}>
            GIGASCOPE &mdash; Community project. Not affiliated with Tesla, SpaceX, xAI,
            Neuralink, or The Boring Company. Not financial advice.
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
  maxWidth: "560px",
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
  fontSize: "20px",
  fontWeight: "600",
  margin: "24px 0 12px",
};

const text = {
  color: "#0a0a0a",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "12px 0",
};

const textMuted = {
  color: "#555",
  fontSize: "13px",
  lineHeight: "1.55",
  margin: "12px 0",
};

const card = {
  border: "1px solid #e5e5e5",
  borderRadius: "6px",
  padding: "14px 18px",
  margin: "16px 0",
};

const cardRow = {
  color: "#0a0a0a",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "4px 0",
};

const cta = {
  backgroundColor: "#0a0a0a",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "12px 20px",
  borderRadius: "6px",
  display: "inline-block",
};

const hr = {
  borderColor: "#e5e5e5",
  margin: "24px 0",
};

const footer = {
  color: "#888",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "4px 0",
};

const footerLink = {
  color: "#666",
  textDecoration: "underline",
};
