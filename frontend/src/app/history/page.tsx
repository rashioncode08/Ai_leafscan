"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getHistory, type HistoryItem } from "@/lib/api";

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  HIGH: { color: "#991b1b", bg: "#fee2e2", label: "Critical" },
  MEDIUM: { color: "#92400e", bg: "#fef3c7", label: "Warning" },
  LOW: { color: "#065f46", bg: "#d1fae5", label: "Stable" },
  NONE: { color: "#166534", bg: "#dcfce7", label: "Healthy" },
};

export default function HistoryPage() {
  const [detections, setDetections] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const data = await getHistory(50);
      setDetections(data.detections);
    } catch {
      // Mock data for display if API fails
      setDetections([
        { id: "1", crop_type: "Tomato", disease_name: "Early Blight", confidence: 95.5, severity: "HIGH", created_at: new Date().toISOString() },
        { id: "2", crop_type: "Potato", disease_name: "Healthy", confidence: 99.1, severity: "NONE", created_at: new Date(Date.now() - 86400000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  }

  const filteredDetections = detections.filter(d => 
    d.disease_name.toLowerCase().includes(filter.toLowerCase()) || 
    d.crop_type.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <main 
      className="min-h-screen relative bg-cover bg-fixed bg-center selection:bg-[var(--green-200)] pb-12"
      style={{ backgroundImage: "url('/0cad129d9c0d34eaac50302009a2360c.jpg')" }}
    >
      <div className="absolute inset-0 bg-[var(--bg)]/80 backdrop-blur-sm z-0"></div>
      <div className="relative z-10 pt-20 md:pt-28 max-w-6xl mx-auto px-6 space-y-8 animate-fade-in-up">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text)] tracking-tight">Scan History</h1>
            <p className="text-[var(--text-secondary)] font-medium">Keep track of your plant health records.</p>
          </div>
          
          <div className="relative w-full md:w-auto">
            <div className="absolute inset-y-0 left-4 flex items-center text-[var(--text-muted)] pointer-events-none">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Filter by crop or disease..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full md:w-80 pl-12 pr-4 py-3 rounded-xl border-2 border-[var(--green-100)] bg-white/60 focus:border-[var(--primary)] outline-none font-medium text-[var(--text)] transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="glass-card rounded-[2rem] overflow-hidden border border-[var(--glass-border)] shadow-[var(--glass-shadow)] w-full bg-white/40 backdrop-blur-xl">
          {/* Mobile View: Cards */}
          <div className="md:hidden divide-y divide-[var(--green-100)]">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-4 border-[var(--green-200)] border-t-[var(--primary)] rounded-full animate-spin mx-auto"></div>
              </div>
            ) : filteredDetections.length === 0 ? (
              <div className="p-12 text-center text-[var(--text-muted)] font-medium">
                No scan records found.
              </div>
            ) : (
              filteredDetections.map((d) => {
                const sev = SEVERITY_CONFIG[d.severity] || SEVERITY_CONFIG.NONE;
                return (
                  <Link 
                    key={d.id} 
                    href={`/results/${d.id}`}
                    className="block p-5 active:bg-[var(--green-50)] transition-colors"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-[var(--green-100)] flex items-center justify-center text-[var(--primary)] shrink-0 shadow-inner overflow-hidden border border-[var(--green-200)]">
                        <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{formatDate(d.created_at)}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: sev.bg, color: sev.color }}>{sev.label}</span>
                        </div>
                        <h3 className="font-extrabold text-[var(--text)] text-lg">{d.disease_name.replace(/_/g, ' ')}</h3>
                        <p className="text-xs text-[var(--text-secondary)] font-medium">Plant: {d.crop_type} • Confidence: {d.confidence}%</p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block overflow-x-auto w-full">
            <table className="table-nature w-full min-w-[800px]">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Plant Image</th>
                  <th>Disease Detected</th>
                  <th>Treatment Given</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="w-8 h-8 border-4 border-[var(--green-200)] border-t-[var(--primary)] rounded-full animate-spin mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredDetections.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[var(--text-muted)] font-medium">
                      No scan records found.
                    </td>
                  </tr>
                ) : (
                  filteredDetections.map((d) => {
                    const sev = SEVERITY_CONFIG[d.severity] || SEVERITY_CONFIG.NONE;
                    return (
                      <tr 
                        key={d.id} 
                        className="hover:bg-[var(--green-50)] transition-colors group cursor-pointer"
                        onClick={() => window.location.href = `/results/${d.id}`}
                      >
                        <td className="whitespace-nowrap text-[var(--text-secondary)] font-bold">{formatDate(d.created_at)}</td>
                        <td>
                          <div className="w-12 h-12 rounded-lg bg-[var(--green-100)] flex items-center justify-center text-[var(--primary)] font-bold shadow-inner overflow-hidden border border-[var(--green-200)]">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        </td>
                        <td>
                          <div className="font-extrabold text-[var(--text)]">{d.disease_name.replace(/_/g, ' ')}</div>
                          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black">{d.crop_type}</div>
                        </td>
                        <td className="max-w-[200px] truncate text-[var(--text-secondary)] font-medium">
                          {d.severity === "NONE" ? "No treatment needed" : "Organic recommended"}
                        </td>
                        <td>
                          <span 
                            className="text-[10px] font-bold px-3 py-1 rounded-full inline-block" 
                            style={{ backgroundColor: sev.bg, color: sev.color }}
                          >
                            {sev.label}
                          </span>
                        </td>
                        <td>
                          <span className="text-[var(--primary)] font-black hover:text-[var(--primary-dark)] transition-colors group-hover:underline">
                            Details →
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
