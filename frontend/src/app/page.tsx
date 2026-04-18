"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

const TRANSLATIONS: Record<string, any> = {
  en: {
    heroTitle: "We take care of your plants intelligently",
    heroDesc: "Experience the future of farming. Detect plant diseases instantly using our state-of-the-art AI. Expert treatment plans at your fingertips.",
    scanTitle: "Analyze Your Plant",
    scanDesc: "Upload or click a photo of the affected leaf to get instant AI diagnosis.",
    uploadOrDrop: "Drag & Drop or Click to Upload",
    takePhoto: "Take Photo",
    chooseGallery: "Choose from Gallery",
    analyzing: "Analyzing Plant...",
    aboutTitle: "Empowering Farmers with AI",
    aboutDesc: "LeafScan is dedicated to bridging the gap between advanced artificial intelligence and everyday farming. Our mission is to provide accessible, highly accurate plant disease detection and sustainable treatment options. We build trust through precision and aim to help agricultural communities thrive.",
    navHome: "Home",
    navAbout: "About Us",
    navSearch: "Search",
    navHistory: "History",
    navWeather: "Weather",
    loginBtn: "Login / Sign In",
  }
};

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState("en");
  const [isAuth, setIsAuth] = useState(false);

  // Scan states
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExecutingScan, setIsExecutingScan] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkAuth = () => setIsAuth(!!localStorage.getItem("kisan_token"));
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, []);

  if (!mounted) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Camera Functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
        setPreview(null);
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
            const file = new File([blob], `scan_${Date.now()}.jpg`, { type: "image/jpeg" });
            setImage(file);
            setPreview(URL.createObjectURL(file));
            stopCamera();
          }
        }, "image/jpeg", 0.95);
      }
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
    stopCamera();
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

  const executeScan = () => {
    if (!image) return;
    setIsExecutingScan(true);
    setTimeout(() => {
      router.push("/scan");
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] selection:bg-[var(--green-200)]">

      {/* ── Hero Section with Video Background and Image Collage ──────────────── */}
      <section className="relative min-h-[100vh] flex items-center justify-center pt-24 pb-28 md:pt-32 md:pb-40 overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/dc0a6f2b4300f5704f25c260209e6477.jpg" 
            alt="Hero Background" 
            className="w-full h-full object-cover scale-100"
          />
          <div className="hero-video-overlay" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12 animate-fade-in-up w-full">
          
          <div className="text-left space-y-6 md:space-y-8 md:w-1/2">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
              We take care of your <br className="hidden md:block"/>
              <span className="text-gradient-light">plants intelligently</span>
            </h1>
            
            <p className="text-base md:text-xl text-white/90 leading-relaxed font-medium drop-shadow">
              {t.heroDesc}
            </p>
            <div className="pt-2 md:pt-4 flex flex-col sm:flex-row gap-3 md:gap-4">
              <a href="#scan" className="btn-primary py-3 px-8 text-base md:text-lg text-center w-full sm:w-auto">Scan Now</a>
              <a href="#about" className="btn-secondary py-3 px-8 text-base md:text-lg text-center w-full sm:w-auto">Learn More</a>
              <Link href="/farm" className="btn-secondary py-3 px-8 text-base md:text-lg text-center w-full sm:w-auto bg-[#4caf50]/10 text-green-300 border-[#4caf50]/50 hover:bg-[#4caf50]/20">Explore Your Area</Link>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center mt-10 md:mt-0">
            {/* Image Collage */}
            <div className="hero-collage scale-90 md:scale-100">
              <div className="hero-collage-img">
                <img src="/Best%20Organic%20Fertilizers%20for%20Summer%20Growth.webp" alt="Organic Fertilizer" />
              </div>
              <div className="hero-collage-img">
                <img src="/plant-disease-2-1.jpg" alt="Plant Disease" />
              </div>
              <div className="hero-collage-img">
                <img src="/images%20(3).jfif" alt="Healthy Field" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── How It Works Section ──────────────────────────────── */}
      <section className="py-20 md:py-24 px-6 bg-[var(--green-50)] relative">
        <div className="max-w-7xl mx-auto text-center space-y-12 md:space-y-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text)]">How LeafScan Works</h2>
            <p className="text-[var(--text-secondary)] font-medium text-base md:text-lg max-w-2xl mx-auto">Three simple steps to healthier plants and better yields.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-3xl bg-white shadow-xl hover:-translate-y-2 transition-transform duration-300 border border-[var(--glass-border)]">
              <div className="w-16 h-16 bg-[var(--green-100)] text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">1</div>
              <h3 className="text-xl font-bold text-[var(--text)] mb-4">Upload Image</h3>
              <p className="text-[var(--text-secondary)]">Take a clear photo of the affected plant leaf or upload from your gallery.</p>
            </div>
            <div className="glass p-8 rounded-3xl bg-white shadow-xl hover:-translate-y-2 transition-transform duration-300 border border-[var(--glass-border)]">
              <div className="w-16 h-16 bg-[var(--green-100)] text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">2</div>
              <h3 className="text-xl font-bold text-[var(--text)] mb-4">AI Analysis</h3>
              <p className="text-[var(--text-secondary)]">Our advanced AI model instantly scans the image to detect any diseases.</p>
            </div>
            <div className="glass p-8 rounded-3xl bg-white shadow-xl hover:-translate-y-2 transition-transform duration-300 border border-[var(--glass-border)]">
              <div className="w-16 h-16 bg-[var(--green-100)] text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">3</div>
              <h3 className="text-xl font-bold text-[var(--text)] mb-4">Get Treatment</h3>
              <p className="text-[var(--text-secondary)]">Receive accurate diagnosis along with organic and chemical treatment recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── About Section ─────────────────────────────────────── */}
      <section id="about" className="py-20 md:py-32 px-6 bg-[var(--bg-warm)] border-y border-[var(--earth-200)] relative overflow-hidden scroll-mt-24">
        <div className="absolute right-0 top-0 w-[800px] h-[800px] bg-[url('/images%20(3).jfif')] bg-cover opacity-5 mix-blend-luminosity rounded-full filter blur-xl translate-x-1/2 -translate-y-1/4"></div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center relative z-10">
          <div className="space-y-6 md:space-y-8 text-left">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--text)] leading-tight">
              {t.aboutTitle.split(' ').slice(0, -1).join(' ')} <br/>
              <span className="text-[var(--primary)]">{t.aboutTitle.split(' ').slice(-1)}</span>
            </h2>
            <div className="w-16 md:w-20 h-2 bg-[var(--primary-light)] rounded-full"></div>
            <p className="text-base md:text-lg text-[var(--text-secondary)] font-medium leading-relaxed">
              {t.aboutDesc}
            </p>
            <ul className="space-y-4 pt-4">
              {['98% Accuracy Models', 'Expert Verified Treatments', 'Community of Farmers'].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-[var(--text)] font-bold">
                  <span className="w-8 h-8 rounded-full bg-[var(--green-200)] text-[var(--primary-dark)] flex items-center justify-center flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative order-first md:order-last">
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl relative max-w-md mx-auto">
              <video 
                src="/crop.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary-dark)]/60 to-transparent flex items-end p-8">
                <div className="glass p-6 w-full backdrop-blur-xl bg-white/20 border-white/30 rounded-2xl">
                  <h4 className="text-white font-bold text-lg">Trusted & Reliable</h4>
                  <p className="text-white/80 font-medium text-sm mt-1">Built with agronomists and AI experts.</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--accent-warm)] rounded-full mix-blend-multiply filter blur-2xl opacity-60"></div>
          </div>
        </div>
      </section>

      {/* ── Interactive Scan CTA Section ──────────────────────── */}
      <section id="scan" className="py-20 md:py-32 px-6 relative scroll-mt-24 overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/a68268f1c84cdb06d93efa985ce9566b.jpg" 
            alt="Scan Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-4 mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--text)]">{t.scanTitle}</h2>
            <p className="text-[var(--text-secondary)] font-medium text-base md:text-lg max-w-2xl mx-auto">{t.scanDesc}</p>
          </div>

          <div className="glass p-8 md:p-12 rounded-[2.5rem] border-[var(--glass-border)] shadow-2xl transition-all bg-white/60 backdrop-blur-xl">
            {isCameraOpen ? (
               <div className="space-y-6 animate-fade-in">
                  <div className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-xl border-4 border-white">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <button onClick={stopCamera} className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur-md">✕</button>
                    <div className="absolute inset-0 border-[2px] border-[var(--primary-light)] border-dashed opacity-50 m-8 rounded-2xl pointer-events-none" />
                  </div>
                  <div className="flex justify-center">
                    <button onClick={capturePhoto} className="w-20 h-20 bg-white border-4 border-[var(--green-100)] rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all">
                      <div className="w-14 h-14 bg-[var(--primary)] rounded-full" />
                    </button>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
               </div>
            ) : isExecutingScan ? (
               <div className="space-y-8 animate-fade-in py-12 flex flex-col items-center">
                 <Loader />
                 <h3 className="text-2xl font-bold text-[var(--text)] mt-8 animate-pulse">Analyzing Leaf Structure...</h3>
               </div>
            ) : preview ? (
               <div className="space-y-8 animate-fade-in">
                 <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl border-4 border-white max-w-2xl mx-auto">
                   <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                   <button onClick={() => setPreview(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/80 text-red-600 rounded-full flex items-center justify-center font-black hover:bg-red-600 hover:text-white transition-all shadow">✕</button>
                 </div>
                 <button onClick={executeScan} className="btn-primary w-full sm:w-auto px-12 py-4 text-xl shadow-lg inline-flex items-center justify-center gap-3">
                   {t.analyzing} <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 </button>
               </div>
            ) : (
               <div 
                 onDragOver={handleDragOver}
                 onDragLeave={handleDragLeave}
                 onDrop={handleDrop}
                 className={`border-3 border-dashed rounded-3xl p-8 md:p-12 transition-all duration-300 flex flex-col items-center justify-center gap-6 min-h-[300px] bg-white/50 ${isDragging ? "border-[var(--primary)] bg-[var(--green-50)] scale-[1.02]" : "border-[var(--green-200)] hover:border-[var(--primary-light)]"}`}
               >
                 <div className="w-20 h-20 rounded-full bg-[var(--green-100)] text-[var(--primary)] flex items-center justify-center shadow-inner animate-float-slow">
                   <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                 </div>
                 <div className="text-center space-y-2">
                   <h3 className="text-xl font-bold text-[var(--text)]">{t.uploadOrDrop}</h3>
                   <p className="text-[var(--text-muted)] text-sm font-medium">Supports JPG, PNG (Max 5MB)</p>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 w-full max-w-md mx-auto">
                    <button onClick={startCamera} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 w-full">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                     {t.takePhoto}
                   </button>
                   <label className="btn-secondary cursor-pointer py-3 px-8 flex items-center justify-center gap-2 flex-1 w-full">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     {t.chooseGallery}
                     <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                   </label>
                 </div>
               </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Farm Mapping Section ─────────────────────────────────────── */}
      <section className="py-32 px-6 bg-[var(--bg)] relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div className="order-last md:order-first relative">
             <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white group">
               <img src="/farm.png" alt="Farm Map" className="w-full object-cover group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
               <div className="absolute bottom-6 left-6 text-white">
                  <h4 className="text-2xl font-black flex items-center gap-2"><span className="text-3xl">🛰️</span> Live Satellite View</h4>
                  <p className="text-sm font-medium opacity-90 mt-1">Track NDVI and crop health from space.</p>
               </div>
             </div>
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-2xl opacity-30"></div>
          </div>
          <div className="space-y-8 text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--text)] leading-tight">
              Monitor Your <span className="text-[var(--primary)]">Entire Area</span>
            </h2>
            <div className="w-20 h-2 bg-[var(--primary-light)] rounded-full"></div>
            <p className="text-lg text-[var(--text-secondary)] font-medium leading-relaxed">
              Don't just scan single leaves. Map your entire field and analyze crop health from space using advanced NDVI satellite imagery. Detect stress patterns early before they spread and optimize your yield.
            </p>
            <div className="pt-4">
               <Link href="/farm" className="btn-primary py-4 px-8 text-lg inline-flex items-center gap-3">
                 Explore My Area <span className="text-xl">→</span>
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-[var(--green-950)] text-white/80 py-16 px-6 border-t-[8px] border-[var(--primary)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--primary-dark)] rounded-full filter blur-[100px] opacity-50 translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 relative z-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img src="/logo(leafscan).png" alt="Logo" className="w-10 h-10 object-contain" />
              <span className="font-extrabold text-2xl tracking-tight text-white">LeafScan</span>
            </div>
            <p className="text-[var(--green-200)] max-w-sm font-medium">
              Intelligent plant care platform powered by AI. Empowering farmers with accurate detection and sustainable treatments.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Quick Links</h4>
            <ul className="space-y-3 font-medium">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/search" className="hover:text-white transition-colors">Search Diseases</Link></li>
              <li><Link href="/weather" className="hover:text-white transition-colors">Weather Insights</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Get Started</h4>
            <Link href="/register" className="inline-block bg-[var(--primary)] text-white font-bold px-8 py-3 rounded-xl hover:bg-[var(--primary-light)] transition-colors shadow-lg">
              Create Free Account
            </Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 text-center font-medium text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} LeafScan. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
