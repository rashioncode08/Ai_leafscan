"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getProfile, getHistory, getFarmScans, getToken } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [farmScans, setFarmScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"scans" | "farms">("scans");

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    Promise.all([
      getProfile().catch(() => null),
      getHistory(10, 0).catch(() => ({ detections: [] })),
      getFarmScans().catch(() => ({ scans: [] })),
    ]).then(([prof, hist, farms]) => {
      setProfile(prof);
      setHistory(hist?.detections || []);
      setFarmScans(farms?.scans || []);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        <p className="font-bold text-slate-500 animate-pulse">Loading Profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen mesh-bg flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-24 h-24 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center text-4xl shadow-xl">
          ⚠️
        </div>
        <h1 className="text-2xl font-black text-slate-900">Session Expired</h1>
        <p className="text-slate-500 font-medium">Please log in again to view your profile.</p>
        <Link href="/login">
          <button className="btn-premium px-10">Log In</button>
        </Link>
      </div>
    );
  }

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const totalScans = history.length;
  const totalFarmScans = farmScans.length;
  const diseases = history.filter(
    (d) => !String(d.disease_name || "").toLowerCase().includes("healthy")
  );
  const healthyCount = totalScans - diseases.length;

  return (
    <main className="min-h-screen mesh-bg py-8 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-slate-800 hover:text-emerald-600 transition-all font-bold"
          >
            <span className="w-8 h-8 rounded-lg glass flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
              ←
            </span>
            Home
          </Link>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <span className="text-4xl">👤</span> My Profile
          </h1>
        </div>

        {/* Profile Card */}
        <div
          className="rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-500/30"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #064e3b 100%)",
          }}
        >
          <div className="p-10 flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="w-28 h-28 rounded-3xl bg-emerald-500/20 border-4 border-emerald-500/40 flex items-center justify-center text-5xl shadow-2xl flex-shrink-0">
              🧑‍🌾
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <h2 className="text-3xl font-black text-white">{profile.name}</h2>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {profile.email && (
                  <span className="flex items-center gap-2 text-emerald-300 text-sm font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {profile.email}
                  </span>
                )}
                {profile.phone && (
                  <span className="flex items-center gap-2 text-emerald-300 text-sm font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {profile.phone}
                  </span>
                )}
                <span className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                  Member since {memberSince}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10 min-w-[90px]">
                <p className="text-3xl font-black text-white">{totalScans}</p>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mt-1">
                  Scans
                </p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10 min-w-[90px]">
                <p className="text-3xl font-black text-white">{totalFarmScans}</p>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mt-1">
                  Farms
                </p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10 min-w-[90px]">
                <p className="text-3xl font-black text-emerald-400">{healthyCount}</p>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mt-1">
                  Healthy
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("scans")}
            className={`flex-1 py-4 rounded-2xl font-black text-sm tracking-wider uppercase transition-all ${
              activeTab === "scans"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                : "glass text-slate-600 hover:bg-white/80"
            }`}
          >
            🔬 Disease Scans ({totalScans})
          </button>
          <button
            onClick={() => setActiveTab("farms")}
            className={`flex-1 py-4 rounded-2xl font-black text-sm tracking-wider uppercase transition-all ${
              activeTab === "farms"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                : "glass text-slate-600 hover:bg-white/80"
            }`}
          >
            🛰️ Farm Scans ({totalFarmScans})
          </button>
        </div>

        {/* Disease Scans */}
        {activeTab === "scans" && (
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="glass p-12 text-center bg-white/60 space-y-4">
                <p className="text-5xl">🌱</p>
                <p className="text-slate-500 font-bold text-lg">No disease scans yet</p>
                <Link href="/scan">
                  <button className="btn-premium px-8">Start Your First Scan</button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((item) => {
                  const isHealthy = String(item.disease_name || "")
                    .toLowerCase()
                    .includes("healthy");
                  const disease = String(item.disease_name || "Unknown")
                    .replace(/___/g, " — ")
                    .replace(/_/g, " ");
                  const date = item.created_at
                    ? new Date(item.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "";

                  return (
                    <Link href={`/results/${item.id}`} key={item.id}>
                      <div className="glass p-6 bg-white/70 card-hover space-y-3 border-l-4 border-l-emerald-500 group">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                              isHealthy
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isHealthy ? "Healthy" : "Disease"}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{date}</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                          {disease}
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-500 font-bold">
                            {item.crop_type || "Unknown Crop"}
                          </span>
                          <span className="text-emerald-600 font-black">
                            {(item.confidence || 0).toFixed(1)}%
                          </span>
                          <span
                            className={`font-black text-xs ${
                              item.severity === "HIGH"
                                ? "text-red-500"
                                : item.severity === "MEDIUM"
                                ? "text-amber-500"
                                : "text-emerald-500"
                            }`}
                          >
                            {item.severity || "LOW"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Farm Scans */}
        {activeTab === "farms" && (
          <div className="space-y-4">
            {farmScans.length === 0 ? (
              <div className="glass p-12 text-center bg-white/60 space-y-4">
                <p className="text-5xl">🛰️</p>
                <p className="text-slate-500 font-bold text-lg">No farm scans saved yet</p>
                <Link href="/farm">
                  <button className="btn-premium px-8">Map Your Farm</button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {farmScans.map((scan) => {
                  const date = scan.created_at
                    ? new Date(scan.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "";
                  const pointCount = scan.coordinates?.length || 0;

                  return (
                    <Link href={`/farm?scan_id=${scan.id}`} key={scan.id}>
                      <div className="glass p-6 bg-white/70 card-hover space-y-3 border-l-4 border-l-cyan-500 cursor-pointer hover:border-cyan-400 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-100 text-cyan-700">
                            🛰️ NDVI Scan
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{date}</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900">
                          {scan.location_name || `Farm Scan (${pointCount} points)`}
                        </h3>
                        {scan.analysis && (
                          <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-3">
                            {scan.analysis}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-medium">
                            📍 {pointCount} boundary points
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
