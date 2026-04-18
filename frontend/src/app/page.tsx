"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const TRANSLATIONS: Record<string, any> = {
  en: {
    heroTag: "Next-Gen Crop Protection",
    heroTitle: "Save Your Crops with Precision AI",
    heroDesc: "Experience the future of farming. Detect 38+ crop diseases instantly using our state-of-the-art vision models. Expert treatment plans at your fingertips.",
    startBtn: "Start Scanning",
    createBtn: "Create Account",
    trustedBy: "Trusted by 10,000+ farmers worldwide",
    featuresTitle: "Built for Visual Intelligence",
    featuresDesc: "Powerful features designed to give your crops the care they deserve.",
    feature1Title: "Instant AI Diagnosis",
    feature1Desc: "Scan any leaf and get 98% accurate results within seconds.",
    feature2Title: "Treatment History",
    feature2Desc: "Keep track of all your scans and progress in one secure place.",
    feature3Title: "Expert Advice",
    feature3Desc: "Get both organic and chemical treatment plans tailored for your crop.",
    ctaTitle: "Ready to Protect Your Harvest?",
    ctaDesc: "Join thousands of farmers using Leaf Scan to grow healthier, more productive crops.",
    ctaBtn: "Get Started for Free",
    myScans: "My Scans",
    logout: "Logout",
    login: "Log In",
    signup: "Get Started",
    farmMap: "Farm Map",
    assistant: "AI Assistant"
  },
  hi: {
    heroTag: "अगली पीढ़ी का फसल संरक्षण",
    heroTitle: "सटीक AI के साथ अपनी फसलें बचाएं",
    heroDesc: "खेती के भविष्य का अनुभव करें। हमारे अत्याधुनिक विज़न मॉडल का उपयोग करके तुरंत 38+ फसल रोगों का पता लगाएं। विशेषज्ञ उपचार योजनाएं आपकी उंगलियों पर।",
    startBtn: "स्कैन शुरू करें",
    createBtn: "खाता बनाएं",
    trustedBy: "दुनिया भर के 10,000+ किसानों द्वारा भरोसा किया गया",
    featuresTitle: "दृश्य बुद्धिमत्ता के लिए निर्मित",
    featuresDesc: "आपकी फसलों को वह देखभाल देने के लिए डिज़ाइन की गई शक्तिशाली विशेषताएं जिनके वे हकदार हैं।",
    feature1Title: "तत्काल AI निदान",
    feature1Desc: "किसी भी पत्ते को स्कैन करें और सेकंड के भीतर 98% सटीक परिणाम प्राप्त करें।",
    feature2Title: "उपचार इतिहास",
    feature2Desc: "अपने सभी स्कैन और प्रगति को एक सुरक्षित स्थान पर ट्रैक करें।",
    feature3Title: "विशेषज्ञ सलाह",
    feature3Desc: "अपनी फसल के लिए तैयार जैविक और रासायनिक दोनों उपचार योजनाएं प्राप्त करें।",
    ctaTitle: "क्या आप अपनी फसल की रक्षा के लिए तैयार हैं?",
    ctaDesc: "स्वस्थ, अधिक उत्पादक फसलें उगाने के लिए लीफ स्कैन का उपयोग करने वाले हजारों किसानों में शामिल हों।",
    ctaBtn: "मुफ्त में शुरू करें",
    myScans: "मेरे स्कैन",
    logout: "लॉगआउट",
    login: "लॉग इन",
    signup: "शुरू करें",
    farmMap: "खेत का नक्शा",
    assistant: "AI सहायक"
  }
};

const FEATURES = (t: any) => [
  { 
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 10L12 14L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    title: t.feature1Title, 
    desc: t.feature1Desc 
  },
  { 
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    title: t.feature2Title, 
    desc: t.feature2Desc 
  },
  { 
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1-1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    title: t.feature3Title, 
    desc: t.feature3Desc 
  },
];

export default function HomePage() {
  const [isAuth, setIsAuth] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem("leaf_scan_lang") || "en";
    setLang(savedLang);
    const checkAuth = () => setIsAuth(!!localStorage.getItem("kisan_token"));
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, []);

  const toggleLang = () => {
    const newLang = lang === "en" ? "hi" : "en";
    setLang(newLang);
    localStorage.setItem("leaf_scan_lang", newLang);
    window.dispatchEvent(new Event("lang-change"));
  };

  if (!mounted) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  return (
    <main className="min-h-screen mesh-bg selection:bg-emerald-200">
      {/* ── Navbar ────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center glass border-b-0 rounded-none bg-white/40">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">LEAF<span className="text-emerald-600">SCAN</span></span>
        </div>

        <div className="flex gap-4 items-center">
          <button 
            onClick={toggleLang}
            className="w-10 h-10 rounded-xl glass border-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center hover:bg-emerald-50 transition-all"
          >
            {lang === "en" ? "HI" : "EN"}
          </button>
          
          {isAuth ? (
            <div className="flex gap-3">
              <Link href="/farm">
                <button className="px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-all shadow-md">
                  {t.farmMap}
                </button>
              </Link>
              <Link href="/profile">
                <button className="px-5 py-2.5 rounded-xl font-bold text-sm bg-cyan-100 text-cyan-800 hover:bg-cyan-200 transition-all shadow-md">
                  👤 Profile
                </button>
              </Link>
              <Link href="/history">
                <button className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md">
                  {t.myScans}
                </button>
              </Link>
              <button 
                onClick={() => {
                  localStorage.removeItem("kisan_token");
                  setIsAuth(false);
                  window.dispatchEvent(new Event("auth-change"));
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-all"
              >
                {t.logout}
              </button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <button className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:text-emerald-600 transition-all">
                  {t.login}
                </button>
              </Link>
              <Link href="/register">
                <button className="px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md">
                  {t.signup}
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {t.heroTag}
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              {t.heroTitle.split("Precision AI")[0]} <span className="text-gradient">Precision AI</span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t.heroDesc}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link href="/scan">
                <button className="btn-premium group w-full sm:w-auto">
                  {t.startBtn}
                  <svg className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </Link>
              <Link href="/farm">
                <button className="btn-outline w-full sm:w-auto bg-white/50 backdrop-blur-sm border-emerald-500 text-emerald-700 hover:bg-emerald-50">
                  🛰️ {t.farmMap}
                </button>
              </Link>
              <Link href="/register">
                <button className="btn-outline w-full sm:w-auto bg-white/50 backdrop-blur-sm">
                  {t.createBtn}
                </button>
              </Link>
            </div>

            <div className="flex items-center gap-6 justify-center lg:justify-start pt-8">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
                ))}
              </div>
              <p className="text-sm font-medium text-slate-500">{t.trustedBy}</p>
            </div>
          </div>

          <div className="flex-1 relative animate-float">
            <div className="relative z-10 glass p-4 rotate-3 hover:rotate-0 transition-all duration-700">
               <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-square lg:aspect-[4/5] relative">
                  {/* Mock Interface */}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent flex flex-col justify-end p-8 text-white">
                    <div className="glass-dark p-6 space-y-3">
                       <div className="flex justify-between items-center">
                          <span className="font-bold">{lang === "en" ? "Tomato Blight" : "टमाटर का अगेती झुलसा"}</span>
                          <span className="text-emerald-400 font-bold text-sm">98.2% {lang === "en" ? "Accuracy" : "सटीकता"}</span>
                       </div>
                       <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[98%]" />
                       </div>
                       <p className="text-xs text-white/70">{lang === "en" ? "Diagnosis complete. View treatment plan now." : "निदान पूरा हुआ। अब उपचार योजना देखें।"}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                     <svg className="w-32 h-32 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                     </svg>
                  </div>
               </div>
            </div>
            {/* Background elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-lime-400/20 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white/50 relative border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900">{t.featuresTitle}</h2>
            <p className="text-slate-600 max-w-xl mx-auto text-lg">{t.featuresDesc}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {FEATURES(t).map((feature, i) => (
              <div key={i} className="glass p-10 card-hover group">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────── */}
      <section className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto glass p-12 lg:p-20 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-8">
            <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight">{t.ctaTitle}</h2>
            <p className="text-slate-400 text-lg max-w-xl">{t.ctaDesc}</p>
            <Link href="/scan">
              <button className="btn-premium px-12 py-5 text-lg">
                {t.ctaBtn}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="py-12 px-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight text-slate-900">LEAF<span className="text-emerald-600">SCAN</span></span>
          </div>
          <p className="text-slate-500 text-sm font-medium">© 2026 Leaf Scan AI. All rights reserved.</p>
          <div className="flex gap-6 text-slate-400">
             <Link href="#" className="hover:text-emerald-600 transition-colors">Twitter</Link>
             <Link href="#" className="hover:text-emerald-600 transition-colors">Privacy</Link>
             <Link href="#" className="hover:text-emerald-600 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
