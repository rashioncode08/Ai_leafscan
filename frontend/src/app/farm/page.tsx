"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamically import MapComponent with SSR disabled since Leaflet uses window
const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

export default function FarmMapPage() {
  const [polygon, setPolygon] = useState<number[][] | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [ndviUrl, setNdviUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handlePolygonDrawn = (coords: number[][]) => {
    setPolygon(coords);
    setNdviUrl(null);
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
        body: JSON.stringify({ coordinates: polygon })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to generate NDVI");
      }

      const data = await res.json();
      setNdviUrl(data.url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred fetching satellite data");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen mesh-bg py-8 px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
           <Link href="/" className="group flex items-center gap-2 text-slate-800 hover:text-emerald-600 transition-all font-bold">
              <span className="w-8 h-8 rounded-lg glass flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">←</span>
              Back to Home
           </Link>
           <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
             <span className="text-4xl">🛰️</span> Farm Mapping & NDVI
           </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Map Container */}
          <div className="lg:col-span-2 h-[600px]">
             <MapComponent onPolygonDrawn={handlePolygonDrawn} ndviPolygon={polygon} ndviUrl={ndviUrl} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass p-6 bg-white/80 rounded-3xl border-2 border-emerald-100 shadow-xl space-y-4">
              <h2 className="text-2xl font-black text-emerald-900">Step 1: Map Your Farm</h2>
              <p className="text-slate-600 font-medium">
                Use the drawing tools (top-left of map) to drop pins around the boundary of your field.
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

            <div className={`glass p-6 rounded-3xl border-2 shadow-xl space-y-4 transition-all ${polygon ? 'bg-slate-900 text-white border-emerald-500' : 'bg-slate-50 border-slate-200 opacity-50 pointer-events-none'}`}>
              <h2 className="text-2xl font-black flex items-center gap-3">
                Step 2: Satellite Scan
              </h2>
              <p className="text-sm font-medium opacity-80 leading-relaxed">
                Fetch Sentinel-2 satellite data to calculate the Normalized Difference Vegetation Index (NDVI) and spot crop stress from space.
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
                     <p className="text-emerald-400 font-black text-sm tracking-widest uppercase">Analysis Complete</p>
                     <div className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full bg-red-500" />
                       <span className="text-sm font-medium">Stressed areas detected</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full bg-emerald-500" />
                       <span className="text-sm font-medium">Healthy vegetation</span>
                     </div>
                  </div>
                  <p className="text-sm italic text-slate-400">
                    * The map now displays actual Sentinel-2 satellite data over your field.
                  </p>
                  <button 
                    onClick={() => { setNdviUrl(null); setPolygon(null); }}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10"
                  >
                    Clear Map
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
