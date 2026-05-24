import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface DripProps {
  email: string;
}

export default function DripD30({ email }: DripProps) {
  return (
    <Html>
      <Head />
      <Preview>
        30 days on the list. Charter is open for the first 100. Here&apos;s the decision.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={brand}>GIGASCOPE</Heading>
          <Text style={tagline}>
            Watch Musk&apos;s empire get built, one satellite frame at a time.
          </Text>

          <Hr style={hr} />

          <Heading style={h2}>30 days on the list. Here&apos;s what&apos;s worth keeping.</Heading>

          <Text style={text}>
            You&apos;ve had a month of digests and five drips. This is the last one
            from the onboarding series.
          </Text>

          <Heading style={h3}>What the last 30 days delivered</Heading>
          <Section style={list}>
            <Text style={listItem}>
              → Multiple sites moved on satellite. Some by enough to matter.
            </Text>
            <Text style={listItem}>
              → A handful of catalysts hit on the calendar window we flagged.
            </Text>
            <Text style={listItem}>
              → At least one Sentinel-2 capture caught something the news cycle
              missed.
            </Text>
          </Section>

          <Text style={text}>
            If any of that was worth your morning attention, charter is the
            decision the series points at.
          </Text>

          <Heading style={h3}>Charter — $9/mo, locked for life</Heading>

          <Text style={text}>
            Charter is locked at $9/mo (or $90/yr &mdash; 17% off) for the
            first 100 members, for life. Once those spots are gone, standard
            pricing is $29/mo, and the long-term tier sits at $49&ndash;79/mo
            as the product matures. Charter members keep the $9 rate as long
            as the subscription stays continuous.
          </Text>

          <Text style={text}>
            What you get: priority on satellite-drop alerts when a site moves,
            full catalyst calendar with primary-source links, and the same
            digest you&apos;ve been reading — uninterrupted as the free tier
            evolves.
          </Text>

          <Section style={ctaWrap}>
            <Button href="https://gigascope.xyz/pro" style={ctaButton}>
              Lock your charter spot — $9/mo
            </Button>
          </Section>

          <Text style={text}>
            Not for you? Reply <b>unsubscribe</b> — no quiz, no retention
            sequence. The daily digest keeps coming either way unless you
            opt out.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            You signed up as {email}. Reply to this email any time — it&apos;s
            read by a human.
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

const h3 = {
  color: "#0a0a0a",
  fontSize: "16px",
  fontWeight: "600",
  margin: "20px 0 8px",
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

const ctaWrap = {
  margin: "28px 0 20px",
  textAlign: "center" as const,
};

const ctaButton = {
  backgroundColor: "#0a0a0a",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "14px 22px",
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
