"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { analyzeFarm, farmChat, saveFarmScan, getFarmScans, getToken } from "@/lib/api";
import Loader from "@/components/Loader";

const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

export default function FarmMapPage() {
  const [polygon, setPolygon] = useState<number[][] | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [ndviUrl, setNdviUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  // AI Analysis
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Save
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [farmHistory, setFarmHistory] = useState<any[]>([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
    if (token) {
      getFarmScans().then(data => {
        const scans = data.scans || [];
        setFarmHistory(scans);
        
        // Auto-load scan if redirected from profile page
        const params = new URLSearchParams(window.location.search);
        const scanId = params.get("scan_id");
        if (scanId) {
          const selectedScan = scans.find((s: any) => s.id === scanId);
          if (selectedScan) {
            setPolygon(selectedScan.coordinates);
            setNdviUrl(selectedScan.ndvi_url);
            setAiAnalysis(selectedScan.analysis);
            setSaved(true);
          }
        }
      }).catch(() => {});
    }
  }, []);

  const handlePolygonDrawn = (coords: number[][]) => {
    setPolygon(coords);
    setNdviUrl(null);
    setAiAnalysis(null);
    setChatMessages([]);
    setSaved(false);
    setError("");
  };

  const handleAnalyze = async () => {
    if (!polygon) return;
    setAnalyzing(true);
    setError("");

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_BASE}/api/farm/ndvi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coordinates: polygon }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to generate NDVI");
      }

      const data = await res.json();
      setNdviUrl(data.url);

      // Auto-trigger AI analysis
      setAiLoading(true);
      try {
        const analysis = await analyzeFarm(polygon, data.url);
        setAiAnalysis(analysis.analysis);
        setAiSource(analysis.source);
      } catch (err) {
        console.error("AI analysis failed:", err);
      } finally {
        setAiLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred fetching satellite data");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!polygon || !ndviUrl) return;
    setSaving(true);
    try {
      const savedScan = await saveFarmScan(polygon, ndviUrl, aiAnalysis || "");
      setSaved(true);
      // Refresh history
      if (isLoggedIn) {
        getFarmScans().then(data => setFarmHistory(data.scans || [])).catch(() => {});
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || !aiAnalysis) return;
    const question = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: question }]);
    setChatLoading(true);

    try {
      const data = await farmChat(aiAnalysis, question);
      setChatMessages((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, I couldn't process your question. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative pb-20">
      {/* Fixed Parallax Background */}
      <div className="fixed inset-0 z-[-1]">
        <div className="absolute inset-0 bg-slate-900/60 z-10 backdrop-blur-[2px]"></div>
        <img src="/a68268f1c84cdb06d93efa985ce9566b.jpg" alt="Farm Background" className="w-full h-full object-cover scale-105" />
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-8 relative z-10 pt-24 md:pt-28">
        {/* Header */}
        <div className="glass p-6 md:p-10 rounded-[2.5rem] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
          <div className="space-y-3 relative z-10 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black text-white flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 drop-shadow-lg tracking-tight">
              <span className="text-4xl md:text-5xl drop-shadow-2xl">🛰️</span> My Area Mapping
            </h1>
            <p className="text-emerald-50 font-medium text-base md:text-xl drop-shadow max-w-2xl">
              Map your field to fetch Sentinel-2 satellite data and detect crop stress from space.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Map Container */}
          <div className="lg:col-span-2 h-[400px] lg:h-[650px] rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.3)] border-[4px] lg:border-[6px] border-white/10 glass bg-slate-900 relative">
            <MapComponent
              onPolygonDrawn={handlePolygonDrawn}
              ndviPolygon={polygon}
              ndviUrl={ndviUrl}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass p-6 md:p-10 bg-white/90 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] border border-white/50 shadow-2xl space-y-8 animate-fade-in-up">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">1</span>
                Map Your Field
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed">
                Use the drawing tools on the map to drop pins around the boundary of your field.
              </p>

              {polygon ? (
                <div className="p-4 bg-emerald-500/10 text-emerald-700 rounded-2xl border border-emerald-200 font-bold flex items-center gap-3 shadow-inner">
                  <span className="text-2xl">✅</span> Boundary saved ({polygon.length} points)
                </div>
              ) : (
                <div className="p-4 bg-slate-100/50 text-slate-500 rounded-2xl border border-slate-200 font-bold flex items-center gap-3">
                  <span className="text-2xl animate-pulse">✏️</span> Waiting for drawing...
                </div>
              )}
            </div>

            <div
              className={`glass p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border shadow-2xl space-y-6 transition-all duration-500 ${
                polygon
                  ? "bg-slate-900/90 backdrop-blur-xl text-white border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                  : "bg-white/40 backdrop-blur-md border-white/20 opacity-60 pointer-events-none"
              }`}
            >
              <h2 className="text-2xl font-black flex items-center gap-3">
                <span className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${polygon ? "bg-emerald-500/20 text-emerald-400" : "bg-white/50 text-slate-500"}`}>2</span>
                Satellite Scan
              </h2>
              <p className="text-sm font-medium opacity-80 leading-relaxed">
                Fetch high-res Sentinel-2 satellite data to calculate the NDVI and spot crop stress from space.
              </p>

              {error && (
                <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl font-bold text-sm border border-red-500/20 flex items-start gap-3">
                  <span className="text-lg">⚠️</span> <span>{error}</span>
                </div>
              )}

              {!ndviUrl ? (
                analyzing ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="scale-75 mb-4">
                      <Loader />
                    </div>
                    <p className="text-emerald-400 font-bold text-lg animate-pulse">Analyzing Satellite Data...</p>
                  </div>
                ) : (
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-emerald-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-xl">🛰️</span> Fetch Satellite Data
                  </button>
                )
              ) : (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-3 backdrop-blur-md">
                    <p className="text-emerald-400 font-black text-xs tracking-widest uppercase mb-1">
                      Analysis Complete
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
                      <span className="text-sm font-semibold text-slate-200">Stressed areas (Red/Yellow)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
                      <span className="text-sm font-semibold text-slate-200">Healthy vegetation (Green)</span>
                    </div>
                  </div>

                  {/* Save + Clear buttons */}
                  <div className="flex flex-col gap-3">
                    {isLoggedIn && (
                      <button
                        onClick={handleSave}
                        disabled={saving || saved}
                        className={`w-full py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-md shadow-lg ${
                          saved
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white hover:-translate-y-1 hover:shadow-emerald-500/25"
                        }`}
                      >
                        {saved ? "✅ Saved to Profile" : saving ? "Saving to Profile..." : "💾 Save to Profile"}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setNdviUrl(null);
                        setPolygon(null);
                        setAiAnalysis(null);
                        setChatMessages([]);
                        setSaved(false);
                      }}
                      className="w-full py-3.5 bg-transparent hover:bg-white/10 text-white/80 hover:text-white font-bold rounded-2xl transition-all border border-white/10 text-sm"
                    >
                      🗑️ Clear Map & Start Over
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Farm History Sidebar */}
            {isLoggedIn && (
              <div className="glass p-8 rounded-[2.5rem] border border-white/50 shadow-2xl space-y-4 bg-white/90 backdrop-blur-xl">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg">📜</span> My Saved Areas
                </h2>
                <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {farmHistory.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl">
                      <p className="text-sm text-slate-500 font-medium">No areas saved yet.</p>
                    </div>
                  ) : (
                    farmHistory.map(scan => (
                      <div key={scan.id} className="p-4 bg-white rounded-2xl border border-slate-200 cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all group"
                        onClick={() => {
                          setPolygon(scan.coordinates);
                          setNdviUrl(scan.ndvi_url);
                          setAiAnalysis(scan.analysis);
                          setChatMessages([]);
                          setSaved(true);
                        }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">
                            {scan.location_name || `Area (${scan.coordinates.length} points)`}
                          </span>
                          <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded-md">
                            {new Date(scan.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{scan.analysis || "No AI analysis available"}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Analysis Section */}
        {(aiLoading || aiAnalysis) && (
          <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-500/30 animate-fade-in">
            <div className="p-8 space-y-5" style={{ background: "linear-gradient(135deg, #0f172a 0%, #064e3b 100%)" }}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-3xl">
                  🧠
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">AI Land Analysis</h3>
                  <p className="text-emerald-400 text-sm font-bold tracking-wider uppercase">
                    Powered by {aiSource === "gemini" ? "Google Gemini" : "NVIDIA Llama 4"}
                  </p>
                </div>
              </div>

              {aiLoading ? (
                <div className="flex flex-col items-center gap-6 p-10 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                  <Loader />
                  <p className="text-emerald-400 font-bold text-lg animate-pulse mt-4">
                    Analyzing satellite imagery with AI... This may take a moment.
                  </p>
                </div>
              ) : (
                <div className="p-6 bg-white/5 rounded-2xl">
                  <p className="text-slate-200 leading-relaxed whitespace-pre-wrap text-[15px]">
                    {aiAnalysis}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Section */}
        {aiAnalysis && (
          <div className="glass rounded-[2.5rem] overflow-hidden border border-white/50 shadow-2xl bg-white/95 backdrop-blur-2xl">
            <div className="p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-emerald-600/30">
                💬
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Ask More About Your Land</h3>
                <p className="text-slate-500 font-medium">
                  Chat with AI about your field analysis
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="p-8 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar bg-slate-50/30">
              {chatMessages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">🌾</div>
                  <h4 className="text-xl font-bold text-slate-700 mb-2">How can I help you?</h4>
                  <p className="text-slate-500 font-medium max-w-md mx-auto">
                    Ask anything about your land — soil health, crop recommendations, water
                    management, or treatment options.
                  </p>
                </div>
              )}

              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  {msg.role === "ai" && (
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xl shadow-md">
                      🤖
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] p-5 rounded-2xl text-[15px] font-medium leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white rounded-tr-sm"
                        : "bg-white text-slate-700 rounded-tl-sm border border-slate-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 text-xl shadow-md">
                      🧑‍🌾
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="flex gap-4 animate-fade-in">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xl shadow-md">
                    🤖
                  </div>
                  <div className="bg-white px-6 py-4 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm flex items-center">
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-slate-100 bg-white flex gap-4 items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !chatLoading && handleChatSend()}
                placeholder="e.g. What fertilizer should I use for this soil?"
                className="flex-1 px-6 py-4 rounded-full border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-medium text-slate-800 bg-slate-50 focus:bg-white transition-all text-[15px]"
              />
              <button
                onClick={handleChatSend}
                disabled={chatLoading || !chatInput.trim()}
                className="w-14 h-14 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-600/30 hover:-translate-y-1"
              >
                <svg className="w-6 h-6 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
