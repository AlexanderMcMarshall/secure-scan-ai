import { ScanRequest, ScanResult, Finding } from "./types";

const STORAGE_KEY = "bradu_secure_scans";

export function getScans(): ScanRequest[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveScan(scan: ScanRequest): void {
  const scans = getScans();
  const idx = scans.findIndex((s) => s.id === scan.id);
  if (idx >= 0) scans[idx] = scan;
  else scans.unshift(scan);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
}

export function getScanById(id: string): ScanRequest | undefined {
  return getScans().find((s) => s.id === id);
}

export function deleteScan(id: string): void {
  const scans = getScans().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
}
