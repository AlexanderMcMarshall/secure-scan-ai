import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, Loader2 } from "lucide-react";
import { getScanById, saveScan } from "@/lib/storage";
import { generateSimulatedResult, SCAN_STEPS } from "@/lib/scanner";
import { ScanRequest } from "@/lib/types";

const ScanProgress = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<ScanRequest | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (!id) return;
    const s = getScanById(id);
    if (!s) return navigate("/");
    if (s.status === "done") return navigate(`/results/${id}`);
    s.status = "scanning";
    saveScan(s);
    setScan(s);
  }, [id, navigate]);

  useEffect(() => {
    if (!scan) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= SCAN_STEPS.length - 1) {
          clearInterval(interval);
          // Generate result
          const result = generateSimulatedResult();
          const updated = { ...scan, status: "done" as const, result };
          saveScan(updated);
          setTimeout(() => navigate(`/results/${scan.id}`), 600);
          return prev;
        }
        setCompletedSteps((c) => [...c, prev]);
        return prev + 1;
      });
    }, 900 + Math.random() * 600);
    return () => clearInterval(interval);
  }, [scan, navigate]);

  if (!scan) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-xl p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-bold text-foreground text-lg">Scanning in progress</h1>
              <p className="text-sm text-muted-foreground truncate max-w-[280px]">{scan.url}</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {SCAN_STEPS.map((step, i) => {
              const isCompleted = completedSteps.includes(i);
              const isActive = i === currentStep;
              const isPending = i > currentStep;

              return (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-colors ${
                    isActive ? "bg-primary/5" : ""
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 text-primary shrink-0 animate-spin" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-border shrink-0" />
                  )}
                  <span className={isPending ? "text-muted-foreground/50" : isActive ? "text-foreground font-medium" : "text-muted-foreground"}>
                    {step}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep + 1) / SCAN_STEPS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Step {currentStep + 1} of {SCAN_STEPS.length}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ScanProgress;
