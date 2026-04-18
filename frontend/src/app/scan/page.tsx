"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
    stopCamera();
  };

  const startCamera = async () => {
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
      console.error("Camera access denied");
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
            handleFile(file);
          }
        }, "image/jpeg", 0.95);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    // Simulate scan
    setTimeout(() => {
      router.push(`/history`);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
           <Link href="/" className="group flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-all font-bold">
              <span className="w-8 h-8 rounded-lg glass flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-all">←</span>
              Back Home
           </Link>
           <h1 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">Scan Plant</h1>
        </div>

        {/* Scan Area */}
        <div className="glass-premium p-8 md:p-12 rounded-[2.5rem] border border-[var(--glass-border)] shadow-2xl relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-50 bg-[var(--glass-dark-bg)] backdrop-blur-md flex flex-col items-center justify-center text-white space-y-6 animate-fade-in">
               <div className="w-64 h-80 relative rounded-2xl overflow-hidden border-4 border-[var(--green-400)] shadow-2xl">
                  {preview && <img src={preview} className="w-full h-full object-cover opacity-60" alt="Scanning..." />}
                  <div className="scan-line" />
               </div>
               <div className="text-center">
                 <h2 className="text-2xl font-black tracking-widest animate-pulse text-white">ANALYZING</h2>
                 <p className="text-[var(--green-200)] font-bold mt-2">Running AI Diagnostics...</p>
               </div>
            </div>
          )}

          {isCameraOpen ? (
            <div className="space-y-6 animate-fade-in">
              <div className="relative aspect-video md:aspect-[4/3] rounded-3xl overflow-hidden bg-black shadow-xl border-4 border-white max-w-2xl mx-auto">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                
                {/* Overlay Controls */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <label className="w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center cursor-pointer backdrop-blur-md transition-all shadow-md">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                  </label>
                  <button onClick={stopCamera} className="w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center font-black backdrop-blur-md transition-all shadow-md">✕</button>
                </div>
                
                <div className="absolute inset-0 border-[2px] border-[var(--primary-light)] border-dashed opacity-40 m-12 rounded-2xl pointer-events-none" />
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <button onClick={capturePhoto} className="w-24 h-24 bg-white border-8 border-[var(--green-100)] rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform active:scale-95">
                  <div className="w-12 h-12 bg-[var(--primary)] rounded-full" />
                </button>
                <p className="text-[var(--text-secondary)] font-bold text-sm uppercase tracking-widest">Capture Leaf</p>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : !preview ? (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-extrabold text-[var(--text)]">Upload Plant Image</h2>
                <p className="text-[var(--text-secondary)] font-medium">For best results, ensure the leaf is clearly visible.</p>
              </div>

              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-3 border-dashed rounded-[2rem] p-12 transition-all duration-300 flex flex-col items-center justify-center gap-6 bg-white/60 ${isDragging ? "border-[var(--primary)] bg-[var(--green-50)] scale-[1.02]" : "border-[var(--green-200)] hover:border-[var(--primary-light)]"}`}
              >
                <div className="w-20 h-20 rounded-full bg-[var(--green-100)] text-[var(--primary)] flex items-center justify-center shadow-inner animate-float-slow">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="space-y-1 text-center">
                  <h3 className="text-lg font-bold text-[var(--text)]">Drag & Drop Image Here</h3>
                  <p className="text-[var(--text-muted)] font-medium text-sm">or click to browse from your device</p>
                </div>
                <label className="btn-secondary cursor-pointer mt-2">
                  Browse Files
                  <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                </label>
              </div>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-[var(--green-200)]"></div>
                <span className="flex-shrink-0 mx-4 text-[var(--text-muted)] font-bold text-sm uppercase tracking-wider">OR</span>
                <div className="flex-grow border-t border-[var(--green-200)]"></div>
              </div>

              <button onClick={startCamera} className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Open Camera
              </button>
            </div>
          ) : (
            <div className="space-y-8 max-w-xl mx-auto">
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                <img src={preview} className="w-full h-full object-cover" alt="Selected Leaf" />
                <button onClick={() => {setPreview(null); setImage(null);}} className="absolute top-4 right-4 w-10 h-10 bg-white/90 text-red-600 rounded-full flex items-center justify-center font-black shadow-lg hover:bg-red-600 hover:text-white transition-all">✕</button>
              </div>

              <button onClick={handleScan} disabled={loading} className="btn-primary w-full py-4 text-xl tracking-wide flex items-center justify-center gap-3">
                {loading ? "PROCESSING..." : "ANALYZE PLANT"}
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </button>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
           <div className="glass-card p-6 flex gap-4 items-start rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-[var(--green-100)] text-[var(--primary-dark)] flex flex-shrink-0 items-center justify-center font-bold">1</div>
              <div>
                 <h4 className="font-bold text-[var(--text)]">Clear Lighting</h4>
                 <p className="text-sm text-[var(--text-secondary)] font-medium mt-1">Take the photo in bright, indirect sunlight for best accuracy.</p>
              </div>
           </div>
           <div className="glass-card p-6 flex gap-4 items-start rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-[var(--green-100)] text-[var(--primary-dark)] flex flex-shrink-0 items-center justify-center font-bold">2</div>
              <div>
                 <h4 className="font-bold text-[var(--text)]">Steady Focus</h4>
                 <p className="text-sm text-[var(--text-secondary)] font-medium mt-1">Ensure the leaf is in focus and fills most of the frame.</p>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
