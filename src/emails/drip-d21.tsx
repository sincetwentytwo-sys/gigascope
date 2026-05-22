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

export default function DripD21({ email }: DripProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Site spotlight — Giga Texas: 6 years from dirt to the second-largest building on Earth.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={brand}>GIGASCOPE</Heading>
          <Text style={tagline}>
            Watch Musk's empire get built, one satellite frame at a time.
          </Text>

          <Hr style={hr} />

          <Heading style={h2}>Site spotlight — Giga Texas: 6 years from dirt.</Heading>

          <Text style={text}>
            Three weeks ago you signed up. Today we go deep on one site: Tesla
            Gigafactory Texas (Austin), the hero of the GIGASCOPE landing page
            and the reason we exist.
          </Text>

          <Section style={list}>
            <Text style={listItem}>Coordinates: ~30.22° N, 97.62° W</Text>
            <Text style={listItem}>Status: expanding</Text>
            <Text style={listItem}>Built progress: 78% built</Text>
            <Text style={listItem}>Footprint: 12M sqft</Text>
            <Text style={listItem}>Annual capacity: 500K+ vehicles</Text>
            <Text style={listItem}>Products: Model Y, Cybertruck, Cybercab</Text>
            <Text style={listItem}>Investment: $10B+</Text>
            <Text style={listItem}>Employees: 20,000+</Text>
            <Text style={listItem}>Groundbreaking: July 2020</Text>
          </Section>

          <Text style={text}>
            In 2019 the Sentinel-2 cloudless mosaic over this plot shows green
            Texas pasture along the Colorado River — nothing else. In 2026 the
            same coordinates show the second-largest building on Earth by
            footprint, with phase 2 and phase 3 expansion shells visible in
            every weekly capture.
          </Text>

          <Text style={text}>
            Giga Texas is the hero of the site for a reason. It's the cleanest
            "dirt to delivery" timelapse in the entire Musk empire — six years,
            one continuous build, every frame on accessible Sentinel-2 data.
            It's the proof case for the methodology that everything else on
            GIGASCOPE uses. If you only watch one site, watch this one.
          </Text>

          <Text style={text}>
            What we're watching in the next captures: the ongoing Cybertruck
            line expansion on the east side, Cybercab tooling rolling into the
            pilot bay, and the phase 3 footprint additions filed in March.
            Not predictions — just what to look for when the next image drops.
          </Text>

          <Text style={text}>
            Every Giga Texas frame on GIGASCOPE is Sentinel-2 (ESA Copernicus,
            10m/pixel, 5-day revisit). You can verify the imagery yourself on
            the ESA browser if you want.
          </Text>

          <Text style={text}>
            Open the site, scrub the timeline, see six years collapse into a
            single scroll.
          </Text>

          <Link href="https://gigascope.xyz/site/giga-texas" style={cta}>
            Open the Giga Texas page →
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
