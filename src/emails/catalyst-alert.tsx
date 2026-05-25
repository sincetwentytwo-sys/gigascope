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

export type CatalystAlertWindow = "t-7" | "t-1" | "t-0";

interface CatalystAlertProps {
  email: string;
  catalyst: {
    symbol: string;
    label: string;
    date: string; // ISO YYYY-MM-DD
    confidence: string;
  };
  window: CatalystAlertWindow;
}

function formatDate(iso: string): string {
  // iso is YYYY-MM-DD. Parse as UTC to avoid timezone drift.
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  const d = new Date(Date.UTC(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10)));
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function headlineFor(window: CatalystAlertWindow): string {
  if (window === "t-7") return "Catalyst incoming in 7 days";
  if (window === "t-1") return "Catalyst incoming tomorrow";
  return "Catalyst today";
}

function previewFor(window: CatalystAlertWindow, symbol: string, label: string): string {
  if (window === "t-7") return `T-7 · ${symbol}: ${label}`;
  if (window === "t-1") return `T-1 · ${symbol}: ${label} — tomorrow`;
  return `T-0 · ${symbol}: ${label} — today`;
}

function confidencePhrase(c: string): string {
  const k = (c || "").toLowerCase();
  if (k === "high") return "high confidence";
  if (k === "medium") return "medium confidence";
  if (k === "low") return "low confidence";
  if (k === "speculative") return "speculative";
  return c || "unspecified confidence";
}

export default function CatalystAlertEmail({ email, catalyst, window }: CatalystAlertProps) {
  const headline = headlineFor(window);
  const preview = previewFor(window, catalyst.symbol, catalyst.label);
  const dateText = formatDate(catalyst.date);

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

          <Heading style={h2}>{headline}</Heading>

          <Text style={text}>
            A catalyst on the GIGASCOPE calendar is approaching. Logged from primary
            sources; date confidence is tagged so you can position accordingly.
          </Text>

          <Section style={card}>
            <Text style={cardSymbol}>{catalyst.symbol}</Text>
            <Text style={cardDate}>{dateText}</Text>
            <Text style={cardLabel}>{catalyst.label}</Text>
            <Text style={cardConfidence}>{confidencePhrase(catalyst.confidence)}</Text>
          </Section>

          <Text style={text}>
            See the SpaceX catalyst grid for context on what else is in the window:
          </Text>

          <Link href="https://gigascope.xyz/spacex-ipo" style={cta}>
            gigascope.xyz/spacex-ipo &rarr;
          </Link>

          <Text style={{ ...text, marginTop: "16px" }}>
            How dates and confidence tiers are sourced:
          </Text>

          <Link href="https://gigascope.xyz/methodology" style={ctaSecondary}>
            Methodology &rarr;
          </Link>

          <Hr style={hr} />

          <Text style={footer}>
            You signed up as {email}. Reply to this email any time.
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

const card = {
  border: "1px solid #e5e5e5",
  borderRadius: "6px",
  padding: "16px 18px",
  margin: "16px 0",
};

const cardSymbol = {
  color: "#0a0a0a",
  fontFamily:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  fontSize: "13px",
  fontWeight: "600",
  letterSpacing: "0.04em",
  margin: "0 0 4px",
};

const cardDate = {
  color: "#0a0a0a",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0 0 8px",
};

const cardLabel = {
  color: "#0a0a0a",
  fontSize: "16px",
  fontWeight: "600",
  lineHeight: "1.4",
  margin: "0 0 8px",
};

const cardConfidence = {
  color: "#666",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  margin: "0",
};

const cta = {
  color: "#0a0a0a",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "underline",
};

const ctaSecondary = {
  color: "#0a0a0a",
  fontSize: "14px",
  fontWeight: "500",
  textDecoration: "underline",
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
