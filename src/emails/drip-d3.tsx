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

interface DripProps {
  email: string;
}

export default function DripD3({ email }: DripProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Three days in. Here&apos;s how the GIGASCOPE digest actually works — and what to ignore.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={brand}>GIGASCOPE</Heading>
          <Text style={tagline}>
            Watch Musk&apos;s empire get built, one satellite frame at a time.
          </Text>

          <Hr style={hr} />

          <Heading style={h2}>Three days in — here&apos;s the rhythm.</Heading>

          <Text style={text}>
            You signed up three days ago. Most &quot;tech newsletter&quot; inboxes spend that
            window front-loading hot takes and recycled tweets. The GIGASCOPE digest does
            one thing: it logs what actually moved on the ground, with a primary-source
            link, and stops.
          </Text>

          <Text style={text}>
            Satellite cadence: Sentinel-2 has a 5-day revisit at 10m resolution. So roughly
            once a week each Musk-empire site gets a fresh, mostly-cloudless frame. You&apos;ll
            see the new captures land in the weekly summary — pad expansions, new
            substations, parking lots filling in, that kind of detail.
          </Text>

          <Text style={text}>
            Milestone log — what counts and what doesn&apos;t:
          </Text>

          <Section style={list}>
            <Text style={listItem}>→ Counts: groundbreaking permits, FAA notices, IR drops, county/state records, SEC and DART filings</Text>
            <Text style={listItem}>→ Counts: utility interconnection requests, environmental review filings, construction RFPs</Text>
            <Text style={listItem}>→ Doesn&apos;t count: aggregator rewrites, anonymous-source posts, &quot;sources tell us&quot; rumor blogs</Text>
            <Text style={listItem}>→ Doesn&apos;t count: anything we can&apos;t link a primary document to</Text>
          </Section>

          <Text style={text}>
            What&apos;s explicitly out of scope: no price predictions, no financial advice, no
            Musk-tweet-of-the-day. If you want those, the rest of the internet has you
            covered.
          </Text>

          <Text style={text}>
            The daily digest is live and lands at 7am local — the cron fires at 14:00 UTC,
            which is 9am US East and 11pm in Korea. If you ever stop seeing it, check spam
            and whitelist the sender.
          </Text>

          <Text style={text}>
            A real example of what&apos;s in the queue this week is on the news page.
          </Text>

          <Link href="https://gigascope.xyz/news" style={cta}>
            See this week&apos;s catalysts →
          </Link>

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
