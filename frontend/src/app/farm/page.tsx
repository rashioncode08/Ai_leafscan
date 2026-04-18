"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { analyzeFarm, farmChat, saveFarmScan, getToken } from "@/lib/api";

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

  const isLoggedIn = typeof window !== "undefined" && !!getToken();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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
      await saveFarmScan(polygon, ndviUrl, aiAnalysis || "");
      setSaved(true);
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
    <main className="min-h-screen mesh-bg py-8 px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-slate-800 hover:text-emerald-600 transition-all font-bold"
          >
            <span className="w-8 h-8 rounded-lg glass flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
              ←
            </span>
            Back to Home
          </Link>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <span className="text-4xl">🛰️</span> Farm Mapping & NDVI
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Container */}
          <div className="lg:col-span-2 h-[600px]">
            <MapComponent
              onPolygonDrawn={handlePolygonDrawn}
              ndviPolygon={polygon}
              ndviUrl={ndviUrl}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass p-6 bg-white/80 rounded-3xl border-2 border-emerald-100 shadow-xl space-y-4">
              <h2 className="text-2xl font-black text-emerald-900">Step 1: Map Your Farm</h2>
              <p className="text-slate-600 font-medium">
                Use the drawing tools (top-left of map) to drop pins around the boundary of your
                field.
              </p>

              {polygon ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-bold flex items-center gap-3">
                  <span className="text-2xl">✅</span> Boundary saved! ({polygon.length} points)
                </div>
              ) : (
                <div className="p-4 bg-slate-100 text-slate-500 rounded-xl border border-slate-200 font-bold flex items-center gap-3">
                  <span className="text-2xl">✏️</span> Waiting for you to draw...
                </div>
              )}
            </div>

            <div
              className={`glass p-6 rounded-3xl border-2 shadow-xl space-y-4 transition-all ${
                polygon
                  ? "bg-slate-900 text-white border-emerald-500"
                  : "bg-slate-50 border-slate-200 opacity-50 pointer-events-none"
              }`}
            >
              <h2 className="text-2xl font-black flex items-center gap-3">Step 2: Satellite Scan</h2>
              <p className="text-sm font-medium opacity-80 leading-relaxed">
                Fetch Sentinel-2 satellite data to calculate the NDVI and spot crop stress from
                space.
              </p>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold text-sm border border-red-200">
                  ⚠️ {error}
                </div>
              )}

              {!ndviUrl ? (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full btn-premium py-4 bg-emerald-600 hover:bg-emerald-500 border-0 flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Fetching Satellite Data...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">📡</span> Generate NDVI Map
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-white/10 rounded-xl space-y-2">
                    <p className="text-emerald-400 font-black text-sm tracking-widest uppercase">
                      Analysis Complete
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm font-medium text-slate-200">Stressed areas (Red/Yellow)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-sm font-medium text-slate-200">Healthy vegetation (Green)</span>
                    </div>
                  </div>

                  {/* Save + Clear buttons */}
                  <div className="flex gap-2">
                    {isLoggedIn && (
                      <button
                        onClick={handleSave}
                        disabled={saving || saved}
                        className={`flex-1 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm ${
                          saved
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white"
                        }`}
                      >
                        {saved ? "✅ Saved to Profile" : saving ? "Saving..." : "💾 Save to Profile"}
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
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10 text-sm"
                    >
                      🗑️ Clear Map
                    </button>
                  </div>
                </div>
              )}
            </div>
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
                <div className="flex items-center gap-3 p-6 bg-white/5 rounded-2xl">
                  <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  <p className="text-slate-300 font-medium">
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
          <div className="glass rounded-3xl overflow-hidden border-2 border-emerald-100 shadow-xl bg-white/80">
            <div className="p-6 border-b border-emerald-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl">
                💬
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Ask More About Your Land</h3>
                <p className="text-slate-500 text-sm font-medium">
                  Chat with AI about your field analysis
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">🌾</p>
                  <p className="text-slate-400 font-medium">
                    Ask anything about your land — soil health, crop recommendations, water
                    management...
                  </p>
                </div>
              )}

              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  {msg.role === "ai" && (
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-lg">
                      🤖
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white rounded-tr-none"
                        : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 text-lg">
                      🧑‍🌾
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-lg">
                    🤖
                  </div>
                  <div className="bg-slate-100 px-5 py-3 rounded-2xl rounded-tl-none border border-slate-200">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-emerald-100 flex gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !chatLoading && handleChatSend()}
                placeholder="e.g. What fertilizer should I use for this soil?"
                className="flex-1 px-5 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none font-medium text-slate-800 bg-white transition-colors"
              />
              <button
                onClick={handleChatSend}
                disabled={chatLoading || !chatInput.trim()}
                className="px-6 py-3.5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Send <span className="text-lg">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
