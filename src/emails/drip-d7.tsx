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

export default function DripD7({ email }: DripProps) {
  return (
    <Html>
      <Head />
      <Preview>
        How we get to &apos;78% built&apos; — the methodology behind every progress number on GIGASCOPE.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={brand}>GIGASCOPE</Heading>
          <Text style={tagline}>
            Watch Musk&apos;s empire get built, one satellite frame at a time.
          </Text>

          <Hr style={hr} />

          <Heading style={h2}>How we know it&apos;s 78% built.</Heading>

          <Text style={text}>
            A reader asked last week how we get to &quot;78% built&quot; for Giga Texas.
            Short answer: manual annotation of the built footprint visible on the
            latest cloud-free Sentinel-2 frame, cross-checked against three things.
          </Text>

          <Section style={list}>
            <Text style={listItem}>
              → Built footprint = manual annotation of finished structures
              visible on the latest cloud-free Sentinel-2 capture (10 m/pixel,
              5-day revisit). Roof and finished shells only — active construction
              zones excluded. We don&apos;t store machine polygons; the number is a
              human estimate from the same frame you can pull from ESA Copernicus.
            </Text>
            <Text style={listItem}>
              → Planned footprint = official site plans, FAA filings (for SpaceX),
              and county building permits where they&apos;re public.
            </Text>
            <Text style={listItem}>
              → Cross-check = county tax records, GIS portals, and drone footage
              from local reporters. Sources cited inline on every site page.
            </Text>
          </Section>

          <Text style={text}>
            What the numbers can&apos;t see: indoor work is invisible from orbit, so a
            site can read &quot;100% built&quot; and still be at 0% production capacity.
            &quot;Operational&quot; means the imagery shows finished structures plus visible
            activity — not that the line is running at nameplate. These are human
            estimates, not audited figures, and they get re-checked each refresh
            cycle.
          </Text>

          <Text style={text}>
            Refresh cadence: operational sites monthly, expanding sites bi-weekly
            when ESRI has a fresh capture, announced sites monthly while we watch
            for groundbreaking.
          </Text>

          <Text style={text}>
            If you ever see a number on GIGASCOPE you can&apos;t replicate from public
            satellite data, it shouldn&apos;t be there. Reply to this email and we&apos;ll
            fix or remove it.
          </Text>

          <Link href="https://gigascope.xyz/methodology" style={cta}>
            Read the full methodology →
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
