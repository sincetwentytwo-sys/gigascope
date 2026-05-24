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
import type { Permit } from "@/lib/permits";

interface PermitAlertProps {
  permits: Permit[];
  /** ISO timestamp of when this batch was collected. */
  generatedAt: string;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "unknown date";
  // SODA returns YYYY-MM-DDTHH:MM:SS.sss with no timezone — treat as UTC.
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  return `${m[1]}-${m[2]}-${m[3]}`;
}

function fmtNumber(n: number | null): string {
  if (n === null) return "—";
  return n.toLocaleString("en-US");
}

function fmtMoney(n: number | null): string {
  if (n === null || n === 0) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString("en-US")}`;
}

function truncate(s: string, max = 240): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

export default function PermitAlertEmail({ permits, generatedAt }: PermitAlertProps) {
  const count = permits.length;
  const headline = `${count} new permit${count === 1 ? "" : "s"} filed at Giga Texas`;
  return (
    <Html>
      <Head />
      <Preview>{`Giga Texas — ${count} new permit${count === 1 ? "" : "s"} (Travis County)`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={brand}>GIGASCOPE · PERMIT ALERT</Heading>

          <Heading style={h2}>{headline}</Heading>

          <Text style={meta}>
            Travis County permit data &middot; generated {fmtDate(generatedAt)}
          </Text>

          <Hr style={hr} />

          {permits.map((p, i) => (
            <Section key={p.id} style={card}>
              <Text style={permitId}>{p.id}</Text>
              <Text style={kv}>
                <span style={k}>Filed:</span> <span style={v}>{fmtDate(p.filedAt)}</span>
              </Text>
              <Text style={kv}>
                <span style={k}>Address:</span>{" "}
                <span style={v}>
                  {p.address}
                  {p.city ? `, ${p.city}` : ""}
                  {p.zip ? ` ${p.zip}` : ""}
                </span>
              </Text>
              <Text style={kv}>
                <span style={k}>Type:</span>{" "}
                <span style={v}>
                  {p.type}
                  {p.workClass ? ` — ${p.workClass}` : ""}
                </span>
              </Text>
              {p.description ? (
                <Text style={desc}>{truncate(p.description)}</Text>
              ) : null}
              <Text style={kv}>
                <span style={k}>Sq ft:</span> <span style={v}>{fmtNumber(p.sqft)}</span>
                {"  "}|{"  "}
                <span style={k}>Valuation:</span> <span style={v}>{fmtMoney(p.valuation)}</span>
              </Text>
              {p.contractor ? (
                <Text style={kv}>
                  <span style={k}>Contractor:</span> <span style={v}>{p.contractor}</span>
                </Text>
              ) : null}
              {p.status ? (
                <Text style={kv}>
                  <span style={k}>Status:</span> <span style={v}>{p.status}</span>
                </Text>
              ) : null}
              <Text style={kv}>
                <span style={k}>Source:</span>{" "}
                <Link href={p.sourceUrl} style={srcLink}>
                  data.austintexas.gov
                </Link>
              </Text>
              {i < permits.length - 1 ? <Hr style={hrInner} /> : null}
            </Section>
          ))}

          <Hr style={hr} />

          <Text style={footnote}>
            PoC alert &mdash; sent to owner only. Subscriber fan-out TBD.
          </Text>
          <Text style={footnote}>
            Source: City of Austin Open Data Portal (Issued Construction Permits, dataset 3syk-w9eu).
            Tesla Road sits in the City of Austin ETJ; permits are filed here even though Giga Texas
            is in unincorporated Travis County.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  color: "#0a0a0a",
};

const container = {
  margin: "0 auto",
  padding: "32px 20px",
  maxWidth: "640px",
};

const brand = {
  color: "#0a0a0a",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.12em",
  margin: "0 0 16px",
  textTransform: "uppercase" as const,
};

const h2 = {
  color: "#0a0a0a",
  fontSize: "22px",
  fontWeight: "700",
  lineHeight: "1.25",
  margin: "0 0 6px",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Helvetica, Arial, sans-serif',
};

const meta = {
  color: "#666",
  fontSize: "12px",
  margin: "0",
};

const hr = {
  borderColor: "#0a0a0a",
  borderTop: "1px solid #0a0a0a",
  margin: "20px 0",
};

const hrInner = {
  borderColor: "#e5e5e5",
  borderTop: "1px dashed #e5e5e5",
  margin: "14px 0 0",
};

const card = {
  margin: "0 0 6px",
};

const permitId = {
  color: "#0a0a0a",
  fontSize: "15px",
  fontWeight: "700",
  letterSpacing: "0.02em",
  margin: "0 0 8px",
};

const kv = {
  color: "#0a0a0a",
  fontSize: "13px",
  lineHeight: "1.55",
  margin: "2px 0",
};

const k = {
  color: "#666",
};

const v = {
  color: "#0a0a0a",
};

const desc = {
  color: "#0a0a0a",
  fontSize: "13px",
  lineHeight: "1.55",
  margin: "8px 0",
  padding: "8px 10px",
  background: "#f6f6f6",
  borderLeft: "2px solid #0a0a0a",
};

const srcLink = {
  color: "#0066cc",
  textDecoration: "underline",
};

const footnote = {
  color: "#888",
  fontSize: "11px",
  lineHeight: "1.5",
  margin: "6px 0",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Helvetica, Arial, sans-serif',
};
