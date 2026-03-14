import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Download, ChevronDown, ChevronUp } from "lucide-react";
import { generatePDF } from "@/lib/pdf";
import { Button } from "@/components/ui/button";
import { getScanById } from "@/lib/storage";
import { ScanRequest, Severity, Finding } from "@/lib/types";
import { ScoreGauge } from "@/components/ScoreGauge";
import { FindingCard } from "@/components/FindingCard";

const Results = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<ScanRequest | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const s = getScanById(id);
    if (!s || !s.result) return navigate("/");
    setScan(s);
  }, [id, navigate]);

  if (!scan?.result) return null;

  const { result } = scan;
  const severityCounts = result.findings.reduce(
    (acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    },
    {} as Record<Severity, number>
  );

  const categories = [...new Set(result.findings.map((f) => f.category))];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">Bradu Secure AI</span>
          </button>
          <Button variant="outline" size="sm" onClick={() => navigate("/history")}>
            All Scans
          </Button>
        </div>
      </nav>

      <div className="container py-8 max-w-4xl">
        {/* Score Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-8 mb-6 text-center"
        >
          <p className="text-sm text-muted-foreground mb-1">Security Assessment</p>
          <p className="text-sm font-medium text-foreground mb-6 truncate">{scan.url}</p>
          <ScoreGauge score={result.score} rating={result.rating} />
          <div className="flex justify-center gap-6 mt-6">
            {(["critical", "high", "medium", "low"] as Severity[]).map((sev) => (
              <div key={sev} className="text-center">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-bold severity-${sev}`}>
                  {severityCounts[sev] || 0}
                </span>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{sev}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Executive Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-6 mb-6"
        >
          <h2 className="font-semibold text-foreground mb-3">Executive Summary</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The security assessment of <strong className="text-foreground">{scan.url}</strong> identified{" "}
            <strong className="text-foreground">{result.findings.length} findings</strong> across {categories.length} categories.
            The overall security score is <strong className="text-foreground">{result.score}/100</strong>, rated as{" "}
            <strong className={`score-${result.rating.toLowerCase().replace(" ", "-")}`}>{result.rating}</strong>.
            {severityCounts.critical > 0 && (
              <span className="text-destructive">
                {" "}There {severityCounts.critical === 1 ? "is" : "are"} {severityCounts.critical} critical{" "}
                finding{severityCounts.critical > 1 ? "s" : ""} requiring immediate attention.
              </span>
            )}
            {" "}The scan completed in {result.scanDuration} seconds. A detailed PDF report has been simulated and would be sent to {scan.email}.
          </p>
        </motion.div>

        {/* Findings by Category */}
        <div className="space-y-3">
          {categories.map((cat, i) => {
            const catFindings = result.findings.filter((f) => f.category === cat);
            const isOpen = expandedCategory === cat;
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedCategory(isOpen ? null : cat)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground text-sm">{cat}</span>
                    <span className="text-xs text-muted-foreground">{catFindings.length} finding{catFindings.length !== 1 ? "s" : ""}</span>
                  </div>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {isOpen && (
                  <div className="border-t border-border p-4 space-y-3">
                    {catFindings.map((f) => (
                      <FindingCard key={f.id} finding={f} />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3 mt-8 pb-12">
          <Button onClick={() => navigate("/")} variant="outline">
            New Scan
          </Button>
          <Button onClick={() => generatePDF(scan)}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
