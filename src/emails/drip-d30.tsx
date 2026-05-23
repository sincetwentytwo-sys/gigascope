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

export default function DripD30({ email }: DripProps) {
  return (
    <Html>
      <Head />
      <Preview>
        One month in. Here&apos;s what&apos;s worth your attention now — and what we ignore on purpose.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={brand}>GIGASCOPE</Heading>
          <Text style={tagline}>
            Watch Musk&apos;s empire get built, one satellite frame at a time.
          </Text>

          <Hr style={hr} />

          <Heading style={h2}>30 days in — what&apos;s worth your attention now.</Heading>

          <Text style={text}>
            A month ago you signed up. This is the last of the onboarding drips —
            from here, it&apos;s just the daily digest. Quick recap of what to track
            and what to ignore. You&apos;re settling in for the long haul; this is
            the rhythm.
          </Text>

          <Heading style={h3}>What we watch closely</Heading>
          <Section style={list}>
            <Text style={listItem}>
              → Sentinel-2 weekly captures across the Musk-empire sites (Tesla, SpaceX, xAI, Neuralink, Boring)
            </Text>
            <Text style={listItem}>
              → Construction milestones with primary-source links (SEC EDGAR, FAA, county building permits, IR drops)
            </Text>
            <Text style={listItem}>
              → Earnings calls and launch manifests on the catalyst calendar
            </Text>
            <Text style={listItem}>
              → Interactive component breakdowns when new components land (Raptor revs, Optimus iterations, 4680 cell variants)
            </Text>
          </Section>

          <Heading style={h3}>What we ignore on purpose</Heading>
          <Section style={list}>
            <Text style={listItem}>→ Stock price predictions and analyst price targets</Text>
            <Text style={listItem}>→ &quot;Musk tweeted X&quot; speculation cycles</Text>
            <Text style={listItem}>→ Aggregator-news churn (Google News RSS, content farms)</Text>
            <Text style={listItem}>→ Affiliate links, paid placements, sponsored posts</Text>
          </Section>

          <Text style={text}>
            The rhythm: the daily digest lands at 7am local. Ad-hoc satellite-drop
            alerts when something material moves. The catalyst calendar for forward
            planning — earnings dates, launch windows, expected permit pulls.
          </Text>

          <Text style={text}>
            On the long game: charter membership opens charter pricing at $9/mo
            (first 100 subscribers, locked for life). Billing isn&apos;t live yet —
            when it opens, charter subscribers go first via a separate email.
            No action needed today.
          </Text>

          <Text style={text}>
            Reply to this email with what&apos;s missing, what&apos;s wrong, or what
            site or company we should cover next. Every reply gets read — this isn&apos;t
            a no-reply address.
          </Text>

          <Link href="https://gigascope.xyz" style={cta}>
            Open gigascope.xyz →
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
