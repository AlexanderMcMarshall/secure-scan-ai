export type Severity = "critical" | "high" | "medium" | "low";
export type ScanStatus = "queued" | "scanning" | "done" | "error";
export type RiskRating = "Excellent" | "Good" | "Needs Work" | "Critical";

export interface Finding {
  id: string;
  category: string;
  title: string;
  severity: Severity;
  description: string;
  remediation: string;
  evidence: string;
}

export interface ScanResult {
  score: number;
  rating: RiskRating;
  findings: Finding[];
  scanDuration: number;
  completedAt: string;
}

export interface ScanRequest {
  id: string;
  url: string;
  email: string;
  status: ScanStatus;
  createdAt: string;
  result?: ScanResult;
}
