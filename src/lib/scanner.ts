import { Finding, Severity, RiskRating, ScanResult } from "./types";

function id() {
  return Math.random().toString(36).slice(2, 10);
}

const HEADER_FINDINGS: Omit<Finding, "id">[] = [
  { category: "HTTP Headers", title: "Missing HSTS Header", severity: "high", description: "The server does not enforce HTTP Strict Transport Security, allowing potential downgrade attacks.", remediation: "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains' header.", evidence: "Response headers did not include Strict-Transport-Security." },
  { category: "HTTP Headers", title: "Missing Content Security Policy", severity: "high", description: "No CSP header detected. The site is vulnerable to XSS and data injection attacks.", remediation: "Implement a Content-Security-Policy header with a restrictive default-src directive.", evidence: "Response headers did not include Content-Security-Policy." },
  { category: "HTTP Headers", title: "Missing X-Content-Type-Options", severity: "medium", description: "Without this header, browsers may MIME-sniff responses, leading to security issues.", remediation: "Add 'X-Content-Type-Options: nosniff' header.", evidence: "Response headers did not include X-Content-Type-Options." },
  { category: "HTTP Headers", title: "Missing Referrer-Policy", severity: "low", description: "No Referrer-Policy header set. Sensitive URL data may leak to third parties.", remediation: "Add 'Referrer-Policy: strict-origin-when-cross-origin' header.", evidence: "Response headers did not include Referrer-Policy." },
  { category: "HTTP Headers", title: "Cookies Missing Secure Flag", severity: "medium", description: "Session cookies are sent over unencrypted connections.", remediation: "Set the Secure flag on all cookies.", evidence: "Set-Cookie header missing Secure attribute." },
  { category: "HTTP Headers", title: "Missing Permissions-Policy", severity: "low", description: "No Permissions-Policy header to restrict browser feature access.", remediation: "Add a Permissions-Policy header to restrict camera, microphone, geolocation access.", evidence: "Response headers did not include Permissions-Policy." },
];

const TLS_FINDINGS: Omit<Finding, "id">[] = [
  { category: "TLS/SSL", title: "TLS 1.0/1.1 Still Enabled", severity: "critical", description: "Legacy TLS versions with known vulnerabilities are still accepted by the server.", remediation: "Disable TLS 1.0 and 1.1. Only allow TLS 1.2 and 1.3.", evidence: "Server accepted TLS 1.0 handshake." },
  { category: "TLS/SSL", title: "Weak Cipher Suites Detected", severity: "high", description: "The server supports cipher suites that are considered weak or broken.", remediation: "Disable CBC-mode ciphers and prefer AEAD cipher suites (e.g., AES-GCM, ChaCha20).", evidence: "Server negotiated TLS_RSA_WITH_AES_128_CBC_SHA." },
  { category: "TLS/SSL", title: "Certificate Expires Within 30 Days", severity: "medium", description: "The SSL certificate is approaching expiration, risking service disruption.", remediation: "Renew the SSL certificate before expiration. Consider automated renewal with Let's Encrypt.", evidence: "Certificate valid until 2026-04-10." },
];

const DNS_FINDINGS: Omit<Finding, "id">[] = [
  { category: "DNS", title: "Missing SPF Record", severity: "high", description: "No SPF record found. Attackers can spoof emails from your domain.", remediation: "Add a TXT record: 'v=spf1 include:_spf.google.com ~all' (adjust for your mail provider).", evidence: "No TXT record matching v=spf1 found for domain." },
  { category: "DNS", title: "Missing DMARC Record", severity: "high", description: "No DMARC policy found. Email authentication cannot be enforced.", remediation: "Add a TXT record at _dmarc.domain.com: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@domain.com'.", evidence: "No TXT record found at _dmarc subdomain." },
  { category: "DNS", title: "Missing DKIM Record", severity: "medium", description: "DKIM signing not detected, reducing email trustworthiness.", remediation: "Configure DKIM signing with your email provider and publish the public key in DNS.", evidence: "No DKIM TXT record found." },
  { category: "DNS", title: "No CAA Record", severity: "low", description: "Without a CAA record, any CA can issue certificates for your domain.", remediation: "Add a CAA DNS record specifying authorized certificate authorities.", evidence: "No CAA record found for domain." },
];

const PORT_FINDINGS: Omit<Finding, "id">[] = [
  { category: "Port Exposure", title: "SSH Port (22) Exposed", severity: "medium", description: "SSH is accessible from the internet, increasing attack surface.", remediation: "Restrict SSH access via firewall rules or use a VPN/bastion host.", evidence: "Port 22 (SSH) responding to SYN probe." },
  { category: "Port Exposure", title: "Database Port (5432) Exposed", severity: "critical", description: "PostgreSQL port is publicly accessible. Database could be compromised.", remediation: "Immediately block port 5432 from public access. Use SSH tunneling or private networking.", evidence: "Port 5432 (PostgreSQL) responding to SYN probe." },
  { category: "Port Exposure", title: "Redis Port (6379) Exposed", severity: "critical", description: "Redis is publicly accessible without authentication by default.", remediation: "Block port 6379 from public access and enable Redis AUTH.", evidence: "Port 6379 (Redis) responding to SYN probe." },
];

const FINGERPRINT_FINDINGS: Omit<Finding, "id">[] = [
  { category: "Fingerprinting", title: "Server Software Version Disclosed", severity: "low", description: "The server reveals its software version, aiding targeted attacks.", remediation: "Configure the server to suppress version information in response headers.", evidence: "Server header: nginx/1.18.0" },
  { category: "Fingerprinting", title: "WordPress Detected (Outdated)", severity: "medium", description: "WordPress installation detected with potentially outdated version.", remediation: "Update WordPress to the latest version and remove version meta tags.", evidence: "Meta generator tag: WordPress 5.8.2" },
];

const ALL_POOLS = [HEADER_FINDINGS, TLS_FINDINGS, DNS_FINDINGS, PORT_FINDINGS, FINGERPRINT_FINDINGS];

function pickRandom<T>(arr: T[], min: number, max: number): T[] {
  const count = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

function calculateScore(findings: Finding[]): { score: number; rating: RiskRating } {
  let score = 100;
  for (const f of findings) {
    switch (f.severity) {
      case "critical": score -= 35; break;
      case "high": score -= 20; break;
      case "medium": score -= 10; break;
      case "low": score -= 3; break;
    }
  }
  score = Math.max(0, Math.min(100, score));
  let rating: RiskRating;
  if (score >= 85) rating = "Excellent";
  else if (score >= 65) rating = "Good";
  else if (score >= 40) rating = "Needs Work";
  else rating = "Critical";
  return { score, rating };
}

export function generateSimulatedResult(): ScanResult {
  const findings: Finding[] = [];
  
  // Pick from each pool
  findings.push(...pickRandom(HEADER_FINDINGS, 1, 4).map(f => ({ ...f, id: id() })));
  findings.push(...pickRandom(TLS_FINDINGS, 0, 2).map(f => ({ ...f, id: id() })));
  findings.push(...pickRandom(DNS_FINDINGS, 1, 3).map(f => ({ ...f, id: id() })));
  findings.push(...pickRandom(PORT_FINDINGS, 0, 2).map(f => ({ ...f, id: id() })));
  findings.push(...pickRandom(FINGERPRINT_FINDINGS, 0, 1).map(f => ({ ...f, id: id() })));

  const { score, rating } = calculateScore(findings);
  
  // Sort by severity
  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);

  return {
    score,
    rating,
    findings,
    scanDuration: 8 + Math.floor(Math.random() * 12),
    completedAt: new Date().toISOString(),
  };
}

export const SCAN_STEPS = [
  "Resolving DNS records...",
  "Checking TLS/SSL configuration...",
  "Analyzing HTTP security headers...",
  "Inspecting cookie security flags...",
  "Scanning SPF/DMARC/DKIM records...",
  "Probing common service ports...",
  "Fingerprinting server software...",
  "Calculating risk score...",
  "Generating AI report...",
];
