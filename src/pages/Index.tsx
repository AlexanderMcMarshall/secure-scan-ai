import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowRight, CheckCircle2, Zap, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { saveScan } from "@/lib/storage";
import { ScanRequest } from "@/lib/types";

const Index = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  const handleScan = () => {
    setError("");
    if (!url.trim()) return setError("Please enter a website URL.");
    if (!email.trim() || !email.includes("@")) return setError("Please enter a valid email.");
    if (!authorized) return setError("You must confirm authorization.");

    const scan: ScanRequest = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      url: url.startsWith("http") ? url.trim() : `https://${url.trim()}`,
      email: email.trim(),
      status: "queued",
      createdAt: new Date().toISOString(),
    };
    saveScan(scan);
    navigate(`/scan/${scan.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-foreground tracking-tight">Bradu Secure AI</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/history")} className="text-muted-foreground">
            Scan History
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="container pt-20 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-sm text-muted-foreground mb-6">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Automated Security Assessment
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
              Investor-ready security report<br />
              <span className="text-primary">in minutes, not weeks</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-12">
              Submit your website URL. Get an AI-generated vulnerability report with a clear risk score, prioritized findings, and actionable remediation steps.
            </p>
          </motion.div>

          {/* Scan Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm max-w-lg mx-auto"
          >
            <h2 className="text-lg font-semibold text-foreground mb-5 text-left">Start a Security Scan</h2>
            <div className="space-y-3">
              <Input
                placeholder="e.g. example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-11"
              />
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
              <label className="flex items-start gap-2.5 text-left cursor-pointer pt-1">
                <Checkbox
                  checked={authorized}
                  onCheckedChange={(v) => setAuthorized(v === true)}
                  className="mt-0.5"
                />
                <span className="text-sm text-muted-foreground leading-snug">
                  I confirm I own or have permission to scan this domain
                </span>
              </label>
              {error && <p className="text-sm text-destructive text-left">{error}</p>}
              <Button onClick={handleScan} className="w-full h-11 font-semibold" size="lg">
                Generate Security Report
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="container pb-20">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-center mb-8">How it works</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Submit URL", desc: "Enter your website domain and email address." },
              { icon: FileText, title: "Automated Scan", desc: "We check headers, TLS, DNS, ports, and more." },
              { icon: Mail, title: "Get Report", desc: "Receive a scored PDF report with prioritized fixes." },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center p-5"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/5 mb-3">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="border-t border-border bg-card py-16">
        <div className="container max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-foreground mb-6">Built for startups without a security team</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {[
              "Can't afford €10K+ pentests",
              "Don't know what's misconfigured",
              "Investors asking about security posture",
              "Need clear priorities, not raw data",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5 p-3">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="container">
          © {new Date().getFullYear()} Bradu Secure AI · Berlin, Germany
        </div>
      </footer>
    </div>
  );
};

export default Index;
