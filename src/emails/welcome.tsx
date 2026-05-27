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

interface WelcomeEmailProps {
  email: string;
  tier?: "free" | "pro" | "terminal";
}

export default function WelcomeEmail({ email, tier = "free" }: WelcomeEmailProps) {
  const isPaid = tier !== "free";
  return (
    <Html>
      <Head />
      <Preview>
        {isPaid
          ? "Charter pricing locked. $9/mo for life."
          : "You're on the daily digest. Charter pricing still open."}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={brand}>GIGASCOPE</Heading>
          <Text style={tagline}>
            Watch the Musk-orbit empire get built, one satellite frame at a time.
          </Text>

          <Hr style={hr} />

          <Heading style={h2}>
            {isPaid ? "You're a charter member." : "You're on the daily digest."}
          </Heading>

          {isPaid ? (
            <>
              <Text style={text}>
                Your <strong>$9/month rate is locked for life</strong> — even when public
                pricing moves to $29 in June 2026, then $49-79 long-term. You're in the first 100.
              </Text>
              <Text style={text}>What unlocks the moment billing goes live:</Text>
            </>
          ) : (
            <>
              <Text style={text}>
                One email a day. Catalysts that moved, satellite captures that dropped,
                milestones logged. Unsubscribe any time.
              </Text>
              <Text style={text}>
                Charter membership ($9/mo charter rate, first 100 subscribers) is still
                open if you want satellite-drop alerts, interactive component breakdowns,
                and CSV/JSON data exports. Price grandfathered when it moves to $29 in June 2026, then $49-79 long-term.
              </Text>
            </>
          )}

          <Section style={list}>
            <Text style={listItem}>→ Sentinel-2 + ESRI satellite captures across Musk-orbit sites — refreshed as new imagery drops (typically every 2-3 months per site)</Text>
            <Text style={listItem}>→ Milestone log: groundbreakings, FAA notices, permit pulls, IR drops</Text>
            <Text style={listItem}>→ Primary-source links only — SEC EDGAR, DART, county records</Text>
            <Text style={listItem}>→ No paid placements, no affiliate links, open source on GitHub</Text>
          </Section>

          <Hr style={hr} />

          <Text style={text}>The free site is fully open. Start here:</Text>

          <Link href="https://gigascope.xyz" style={cta}>
            gigascope.xyz →
          </Link>

          {!isPaid && (
            <>
              <Text style={{ ...text, marginTop: "16px" }}>
                Want the full alerts + data exports?
              </Text>
              <Link href="https://gigascope.xyz/pro" style={ctaSecondary}>
                See charter membership →
              </Link>
            </>
          )}

          <Hr style={hr} />

          <Text style={footer}>
            You signed up as {email}. Reply to this email any time.
          </Text>
          <Text style={footer}>
            GIGASCOPE — Community project. Not affiliated with Tesla, SpaceX, xAI,
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

const list = {
  margin: "12px 0",
};

const listItem = {
  color: "#0a0a0a",
  fontSize: "14px",
  lineHeight: "1.8",
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
