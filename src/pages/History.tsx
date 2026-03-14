import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getScans, deleteScan } from "@/lib/storage";
import { ScanRequest } from "@/lib/types";

const History = () => {
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanRequest[]>([]);

  useEffect(() => {
    setScans(getScans());
  }, []);

  const handleDelete = (id: string) => {
    deleteScan(id);
    setScans(getScans());
  };

  const ratingColor = (rating?: string) => {
    switch (rating) {
      case "Excellent": return "text-success";
      case "Good": return "text-success";
      case "Needs Work": return "score-needs-work";
      case "Critical": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">Bradu Secure AI</span>
          </button>
        </div>
      </nav>

      <div className="container py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Scan History</h1>

        {scans.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground mb-4">No scans yet</p>
            <Button onClick={() => navigate("/")}>Start your first scan</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {scans.map((scan) => (
              <div key={scan.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground text-sm truncate">{scan.url}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(scan.createdAt).toLocaleDateString()} · {scan.email}
                  </p>
                  {scan.result && (
                    <p className="text-xs mt-1">
                      Score: <span className={`font-bold ${ratingColor(scan.result.rating)}`}>{scan.result.score}/100</span>
                      <span className="text-muted-foreground"> · {scan.result.rating}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {scan.status === "done" && (
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/results/${scan.id}`)}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(scan.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
