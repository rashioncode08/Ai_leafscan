"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { detectDisease } from "@/lib/api";
import Link from "next/link";

export default function ScanPage() {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError("");
      stopCamera();
    }
  };

  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
        setPreview(null);
        setImage(null);
      }
    } catch (err) {
      setError("Camera access denied. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
            setImage(file);
            setPreview(URL.createObjectURL(file));
            stopCamera();
          }
        }, "image/jpeg", 0.95);
      }
    }
  };

  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    setError("");

    try {
      const language = localStorage.getItem("leaf_scan_lang") || "en";
      const res = await detectDisease(image, "", language);
      router.push(`/results/${res.id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen mesh-bg py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
           <Link href="/" className="group flex items-center gap-2 text-slate-800 hover:text-emerald-600 transition-all font-bold">
              <span className="w-8 h-8 rounded-lg glass flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">←</span>
              Back Home
           </Link>
           <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">SCAN <span className="text-emerald-600">LEAF</span></h1>
        </div>

        {/* Scan Area */}
        <div className="glass p-10 relative overflow-hidden group">
          {loading && (
            <div className="absolute inset-0 z-50 bg-emerald-900/60 backdrop-blur-md flex flex-col items-center justify-center text-white space-y-6 animate-fade-in">
               <div className="w-64 h-80 relative rounded-2xl overflow-hidden border-4 border-emerald-400 shadow-2xl">
                  {preview && <img src={preview} className="w-full h-full object-cover" alt="Scanning..." />}
                  <div className="scan-line" />
               </div>
               <div className="text-center">
                 <h2 className="text-2xl font-black tracking-widest animate-pulse">ANALYZING...</h2>
                 <p className="text-emerald-200 font-bold mt-2">Deep Neural Network in progress</p>
               </div>
            </div>
          )}

          {isCameraOpen ? (
            <div className="space-y-6 animate-fade-in">
              <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-black shadow-2xl border-4 border-white">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none flex items-center justify-center">
                   <div className="w-48 h-48 border-2 border-emerald-400/50 rounded-3xl" />
                </div>
                
                {/* Overlay Controls */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <label className="w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center cursor-pointer backdrop-blur-md transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                  </label>
                  <button 
                    onClick={stopCamera}
                    className="w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center font-black backdrop-blur-md transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={capturePhoto}
                  className="w-24 h-24 bg-white border-8 border-emerald-100 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform active:scale-95"
                >
                  <div className="w-12 h-12 bg-emerald-600 rounded-full" />
                </button>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Tap to capture leaf</p>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : !preview ? (
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={startCamera}
                className="flex flex-col items-center justify-center w-full aspect-square md:aspect-[4/3] cursor-pointer border-4 border-dashed border-emerald-100 rounded-3xl hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
              >
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-xl font-black text-slate-800 mb-2">Open Camera</p>
                <p className="text-slate-500 font-medium">Capture photo directly</p>
              </button>

              <label className="flex items-center justify-center w-full p-6 glass border-2 border-emerald-50 text-slate-600 font-bold cursor-pointer hover:bg-white transition-all">
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Or Upload Gallery Image
                <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
              </label>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img src={preview} className="w-full h-full object-cover" alt="Selected Leaf" />
                <button 
                  onClick={() => {setPreview(null); setImage(null);}}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 text-red-600 rounded-full flex items-center justify-center font-black shadow-lg hover:bg-red-600 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl font-bold flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
              )}

              <button 
                onClick={handleScan}
                disabled={loading}
                className="btn-premium w-full py-5 text-xl tracking-wide flex items-center justify-center gap-3 shadow-[0_20px_40px_-15px_rgba(5,150,105,0.4)]"
              >
                {loading ? "PROCESSING..." : "RUN AI DIAGNOSIS"}
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="glass p-6 flex gap-4 items-start bg-white/40">
              <div className="w-10 h-10 rounded-xl bg-lime-100 text-lime-700 flex flex-shrink-0 items-center justify-center font-bold">1</div>
              <div>
                 <h4 className="font-bold text-slate-800">Clear Lighting</h4>
                 <p className="text-sm text-slate-500 font-medium">Take the photo in bright, indirect sunlight for best accuracy.</p>
              </div>
           </div>
           <div className="glass p-6 flex gap-4 items-start bg-white/40">
              <div className="w-10 h-10 rounded-xl bg-lime-100 text-lime-700 flex flex-shrink-0 items-center justify-center font-bold">2</div>
              <div>
                 <h4 className="font-bold text-slate-800">Steady Focus</h4>
                 <p className="text-sm text-slate-500 font-medium">Ensure the leaf is in focus and fills most of the frame.</p>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
