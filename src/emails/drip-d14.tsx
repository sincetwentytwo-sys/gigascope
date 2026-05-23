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

export default function DripD14({ email }: DripProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Why charter pricing is $9 and stays $9 — even when we move to $29, then $49-79.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={brand}>GIGASCOPE</Heading>
          <Text style={tagline}>
            Watch Musk's empire get built, one satellite frame at a time.
          </Text>

          <Hr style={hr} />

          <Heading style={h2}>Why $9 stays $9 — the charter math.</Heading>

          <Text style={text}>
            You've been on the GIGASCOPE list for two weeks. Time to lay out
            what the Investor tier actually is — and why charter pricing exists.
          </Text>

          <Text style={text}>The math, plain:</Text>
          <Section style={list}>
            <Text style={listItem}>
              → <strong>$9/month</strong> today — charter rate, first 100 subscribers, locked for life
            </Text>
            <Text style={listItem}>
              → <strong>$29/month</strong> standard launch — from June 2026, subscriber #101 onwards
            </Text>
            <Text style={listItem}>
              → <strong>$49-79/month</strong> long-term target — depends on validation
            </Text>
            <Text style={listItem}>
              → Annual plan: <strong>17% off</strong> (2 months free) — charter annual = $90/yr
            </Text>
            <Text style={listItem}>
              → The $9 charter rate is grandfathered for life — even when public
              pricing moves
            </Text>
          </Section>

          <Text style={text}>
            Why the bump: $9 was too cheap for unique data. Bloomberg Terminal is
            $2K/mo, Visible Alpha is ~$500/mo. GIGASCOPE at $29 is still a steal —
            and charter members lock in $9 forever. Charter funds the next 50
            company pages, satellite pipeline, and Telegram alert system (on the
            build roadmap). You're not buying a finished product — you're buying
            it built faster, with a price locked in.
          </Text>

          <Text style={text}>
            What unlocks the moment billing goes live:
          </Text>
          <Section style={list}>
            <Text style={listItem}>
              → <strong>Real-time alerts (email)</strong> — construction
              progress jumps, fab milestones, regulatory decisions, earnings,
              launches
            </Text>
            <Text style={listItem}>
              → <strong>Curated daily digest</strong> at 7am local —
              cross-company synthesis: what mattered, what's next, with
              primary-source links
            </Text>
            <Text style={listItem}>
              → <strong>Interactive component breakdowns</strong> — click
              any component on Raptor, Optimus, Cybertruck, 4680, GB200 to see
              the part, the spec, the supplier
            </Text>
            <Text style={listItem}>
              → <strong>Data downloads (CSV, JSON)</strong> — milestones,
              facility coordinates, supply-chain edges, historical timelines
            </Text>
            <Text style={listItem}>
              → <strong>Comparison tools</strong> — Gigafactories vs Pyeongtaek,
              MI300X vs B200, Tanbreez vs Mountain Pass
            </Text>
            <Text style={listItem}>
              → <strong>No ads, no upsells</strong> — single tier, one identity
            </Text>
          </Section>

          <Text style={text}>
            This is not equity in the project, not a token, not a security.
            It's a $9/month subscription to a software service. Cancel any time.
          </Text>

          <Text style={text}>
            Billing isn't live yet. When it opens, charter subscribers go first
            — you'll get an email with a checkout link. No further action needed
            today.
          </Text>

          <Link href="https://gigascope.xyz/investor" style={cta}>
            See the Investor tier →
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
