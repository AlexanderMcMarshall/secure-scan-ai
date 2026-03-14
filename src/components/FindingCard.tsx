import { Finding } from "@/lib/types";
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from "lucide-react";

const severityConfig = {
  critical: { icon: ShieldAlert, label: "Critical" },
  high: { icon: AlertTriangle, label: "High" },
  medium: { icon: AlertCircle, label: "Medium" },
  low: { icon: Info, label: "Low" },
};

export const FindingCard = ({ finding }: { finding: Finding }) => {
  const config = severityConfig[finding.severity];
  const Icon = config.icon;

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-start gap-3 mb-2">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold severity-${finding.severity}`}>
          <Icon className="h-3 w-3" />
          {config.label}
        </span>
        <h4 className="font-medium text-foreground text-sm">{finding.title}</h4>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{finding.description}</p>
      <div className="bg-muted/50 rounded-md p-3 mb-2">
        <p className="text-xs text-muted-foreground font-medium mb-0.5">Evidence</p>
        <p className="text-xs text-foreground font-mono">{finding.evidence}</p>
      </div>
      <div className="bg-success/5 rounded-md p-3">
        <p className="text-xs text-success font-medium mb-0.5">Remediation</p>
        <p className="text-xs text-foreground">{finding.remediation}</p>
      </div>
    </div>
  );
};
