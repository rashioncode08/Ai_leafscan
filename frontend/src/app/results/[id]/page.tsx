"use client";

import { useState, useEffect, use, useRef } from "react";
import { getDetection, reanalyzeDetection, getDiseaseRisk, resultChat, getResultChatHistory } from "@/lib/api";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

const UI_STRINGS: Record<string, any> = {
  en: {
    history: "History",
    export: "Export PDF",
    healthy: "✓ HEALTHY",
    pathogen: "⚡ PATHOGEN DETECTED",
    confidence: "AI Confidence",
    severity: "Severity",
    listen: "LISTEN TO REPORT",
    speaking: "SPEAKING REPORT...",
    protocol: "Expert Treatment Protocol",
    organic: "Organic Solution",
    chemical: "Chemical Plan",
    advisory: "AI ADVISORY REPORT",
    prevention: "Preventative Measures",
    another: "Perform Another Scan",
    safe: "ENVIRONMENTALLY SAFE",
    efficacy: "FAST ACTING / HIGH EFFICACY",
    visionBtn: "Advanced AI Check",
    visionTitle: "Advanced Vision Insight",
    visionDesc: "Request a second opinion from our Gemini Vision AI for a deeper analysis of this leaf image.",
    visionError: "Vision AI is unavailable. Please check your API keys on the backend.",
    correctionApplied: "Expert Analysis Complete",
  },
  hi: {
    history: "इतिहास",
    export: "PDF निर्यात करें",
    healthy: "✓ स्वस्थ",
    pathogen: "⚡ रोग का पता चला",
    confidence: "AI सटीकता",
    severity: "गंभीरता",
    listen: "रिपोर्ट सुनें",
    speaking: "रिपोर्ट सुनाई दे रही है...",
    protocol: "विशेषज्ञ उपचार प्रोटोकॉल",
    organic: "जैविक समाधान",
    chemical: "रासायनिक योजना",
    advisory: "AI सलाहकार रिपोर्ट",
    prevention: "निवारक उपाय",
    another: "एक और स्कैन करें",
    safe: "पर्यावरण के लिए सुरक्षित",
    efficacy: "तेजी से काम करने वाला / उच्च प्रभावशीलता",
    visionBtn: "उन्नत AI जाँच",
    visionTitle: "उन्नत विज़न अंतर्दृष्टि",
    visionDesc: "इस पत्ती छवि के गहन विश्लेषण के लिए हमारे Gemini Vision AI से दूसरी राय का अनुरोध करें।",
    visionError: "Vision AI उपलब्ध नहीं है। कृपया बैकएंड पर अपनी API कुंजियाँ जांचें।",
    correctionApplied: "विशेषज्ञ विश्लेषण पूरा हुआ",
  }
};

export default function ResultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [lang, setLang] = useState("en");
  const [visionAnalysis, setVisionAnalysis] = useState<string | null>(null);
  const [visionSource, setVisionSource] = useState<string>("");
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionError, setVisionError] = useState("");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem("leaf_scan_lang") || "en";
    setLang(savedLang);

    getDetection(id)
      .then((d) => {
        setData(d);
        // If the backend already ran Vision AI (low confidence), show it automatically
        if (d.vision_analysis) {
          setVisionAnalysis(d.vision_analysis);
          setVisionSource(d.vision_source || "gemini_vision");
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));

    // Load chat history
    getResultChatHistory(id)
      .then((res) => {
        if (res.messages?.length) {
          const msgs: ChatMessage[] = [];
          res.messages.forEach((m: any) => {
            msgs.push({ role: "user", text: m.question });
            msgs.push({ role: "ai", text: m.answer });
          });
          setChatMessages(msgs);
        }
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (data && data.disease_name) {
      // Fetch weather based on geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeather(position.coords.latitude, position.coords.longitude, data.disease_name);
          },
          (err) => {
            console.warn("Geolocation blocked, using default (Delhi)", err);
            fetchWeather(28.6139, 77.2090, data.disease_name);
          }
        );
      } else {
        fetchWeather(28.6139, 77.2090, data.disease_name);
      }
    }
  }, [data]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const question = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: question }]);
    setChatLoading(true);
    try {
      const res = await resultChat(id, question, lang);
      setChatMessages((prev) => [...prev, { role: "ai", text: res.answer }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "ai", text: "Sorry, I couldn't process your question. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const fetchWeather = async (lat: number, lon: number, disease: string) => {
    try {
      const result = await getDiseaseRisk(lat, lon, disease);
      setWeatherData(result);
    } catch (e) {
      console.error("Failed to fetch weather", e);
    } finally {
      setWeatherLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang === "hi" ? "hi-IN" : "en-US";
      utter.rate = 0.85;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utter);
    }
  };

  const handleVisionCheck = async () => {
    setVisionLoading(true);
    setVisionError("");
    try {
      const result = await reanalyzeDetection(id);
      setVisionAnalysis(result.analysis);
      setVisionSource(result.source);
    } catch (err: any) {
      setVisionError(err.message || "Re-analysis failed");
    } finally {
      setVisionLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center p-6 text-center space-y-4">
       <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
       <p className="font-bold text-slate-500 animate-pulse">{lang === 'hi' ? 'रिपोर्ट प्राप्त की जा रही है...' : 'Retrieving Report...'}</p>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center p-6 text-center space-y-6">
       <div className="w-24 h-24 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center text-4xl shadow-xl">⚠️</div>
       <div className="space-y-2">
         <h1 className="text-2xl font-black text-slate-900">{lang === 'hi' ? 'रिपोर्ट गायब है' : 'Report Missing'}</h1>
         <p className="text-slate-500 font-medium">{lang === 'hi' ? 'हमें अनुरोधित स्कैन परिणाम नहीं मिल सके।' : "We couldn't find the requested scan results."}</p>
       </div>
       <Link href="/history">
          <button className="btn-premium px-10">{lang === 'hi' ? 'इतिहास पर वापस जाएं' : 'Back to History'}</button>
       </Link>
    </div>
  );

  const t = UI_STRINGS[lang] || UI_STRINGS.en;
  const disease = String(data.disease_name || "Unknown").replace(/___/g, " — ").replace(/_/g, " ");
  const isHealthy = String(data.disease_name).toLowerCase().includes("healthy");
  const confidence = data.confidence || 0;
  const severity = data.severity || "LOW";

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const imageUrl = data.image_filename
    ? `${API_BASE}/api/history/${data.id}/image`
    : "https://images.unsplash.com/photo-1597113366853-9a93ad3f5d05?q=80&w=2000";

  return (
    <main className="min-h-screen mesh-bg py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Nav */}
        <div className="flex items-center justify-between mb-4">
           <Link href="/history" className="group flex items-center gap-2 text-slate-800 hover:text-emerald-600 transition-all font-bold">
              <span className="w-8 h-8 rounded-lg glass flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">←</span>
              {t.history}
           </Link>
           <button 
             onClick={() => window.print()}
             className="glass px-4 py-2 text-sm font-bold text-slate-800 hover:bg-white transition-all flex items-center gap-2"
           >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2" /></svg>
             {t.export}
           </button>
        </div>

        {/* Top Section: Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
              <img src={imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Scanned Leaf" />
              <div className="absolute top-6 left-6">
                 <span className={`px-4 py-2 rounded-full font-black text-sm shadow-xl ${isHealthy ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {isHealthy ? t.healthy : t.pathogen}
                 </span>
              </div>
           </div>

           <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                 <p className="text-emerald-600 font-black tracking-widest text-sm uppercase">{data.crop_type || "Crop"} Analysis</p>
                 <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">{disease}</h1>
                 {confidence < 85 && (
                   <div className="flex items-center gap-2 mt-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                     <span className="text-amber-600 text-lg">⚠️</span>
                     <p className="text-amber-800 font-bold text-sm">
                       {lang === 'hi' ? 'कम सटीकता — यह रोग मॉडल के प्रशिक्षण सेट में नहीं हो सकता। नीचे Vision AI विश्लेषण देखें।' : 'Low confidence — this disease may be outside the model\'s training set. See Vision AI analysis below.'}
                     </p>
                   </div>
                 )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="glass p-5 space-y-2 bg-white/60">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wider">{t.confidence}</p>
                    <p className="text-3xl font-black text-emerald-600">{confidence.toFixed(1)}%</p>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${confidence}%` }} />
                    </div>
                 </div>
                 <div className="glass p-5 space-y-2 bg-white/60">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wider">{t.severity}</p>
                    <p className="text-3xl font-black text-red-500">{severity}</p>
                    <div className="flex gap-1">
                       {[1,2,3].map(i => (
                         <div key={i} className={`h-1.5 flex-1 rounded-full ${i === 1 ? 'bg-red-500' : (severity !== "LOW" && i === 2 ? 'bg-red-500' : (severity === "HIGH" && i === 3 ? 'bg-red-500' : 'bg-slate-200'))}`} />
                       ))}
                    </div>
                 </div>
              </div>

               <button 
                 onClick={() => speakText(lang === 'hi' ? 
                   `${disease} का पता चला है। गंभीरता ${severity} है।` : 
                   `${disease} detected. Severity is ${severity}.`)}
                 className="w-full glass py-4 text-emerald-800 font-bold hover:bg-white transition-all flex items-center justify-center gap-2 rounded-2xl"
               >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                 {speaking ? t.speaking : t.listen}
               </button>

               {/* Weather Risk Card */}
               {weatherData && (
                  <div className="glass p-5 flex flex-col space-y-3 bg-white/80 rounded-2xl border-2 border-emerald-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-lg">🌦️</span> {weatherData.weather.location} Weather
                      </p>
                      <span className="font-bold text-slate-700">{weatherData.weather.temp}°C, {weatherData.weather.humidity}% Humidity</span>
                    </div>
                    
                    <div className={`p-4 rounded-xl border ${
                      weatherData.risk.level === 'CRITICAL' ? 'bg-red-50 border-red-200 text-red-800' :
                      weatherData.risk.level === 'HIGH' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                      'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}>
                      <p className="font-black text-sm uppercase mb-1">
                        {weatherData.risk.level} SPREAD RISK
                      </p>
                      <p className="text-sm font-medium">{weatherData.risk.message}</p>
                    </div>
                  </div>
               )}
            </div>
        </div>

        {/* Vision Re-Analysis Section */}
        {!visionAnalysis && (
          <div className="p-8 rounded-3xl space-y-4 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]" style={{ background: '#0f172a' }}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-emerald-400">{t.visionTitle}</h3>
                <p className="text-sm max-w-lg" style={{ color: '#94a3b8' }}>{t.visionDesc}</p>
              </div>
              <button 
                onClick={handleVisionCheck}
                disabled={visionLoading}
                className="btn-premium px-8 py-3 whitespace-nowrap bg-emerald-600 hover:bg-emerald-500 border-0 flex items-center gap-3"
              >
                {visionLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                {t.visionBtn}
              </button>
            </div>
            {visionError && (
              <div className="mt-4 p-4 rounded-xl text-sm font-bold" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)', color: '#fca5a5' }}>
                ⚠️ {visionError}
              </div>
            )}
          </div>
        )}

        {visionAnalysis && (
          <div className="p-8 rounded-3xl space-y-4 animate-fade-in" style={{ background: '#065f46' }}>
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(255,255,255,0.2)' }}>✨</div>
                <h3 className="text-xl font-black text-white">{t.correctionApplied}</h3>
             </div>
             <p className="text-lg leading-relaxed whitespace-pre-wrap" style={{ color: '#d1fae5' }}>{visionAnalysis}</p>
             <div className="flex gap-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-white" style={{ background: 'rgba(255,255,255,0.2)' }}>Source: {visionSource.replace("_", " ")}</span>
             </div>
          </div>
        )}

        {/* Treatment Plans */}
        <div className="space-y-6">
           <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-xl">🛡️</span>
              {t.protocol}
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Organic Plan */}
              <div className="glass p-8 space-y-6 border-l-8 border-l-lime-500 bg-white/80">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-lime-100 text-lime-700 rounded-2xl flex items-center justify-center text-2xl">🍃</div>
                    <h3 className="text-2xl font-black text-slate-900">{t.organic}</h3>
                 </div>
                 <div className="prose prose-slate max-w-none text-slate-900 font-medium leading-relaxed">
                    {data.recommendation?.treatment_data?.organic || (lang === 'hi' ? 'मानक जैविक कवकनाशी (नीम का तेल) लगाने की सिफारिश की जाती है। खेत की स्वच्छता बनाए रखें।' : "Standard organic fungicide (Neem Oil) application recommended. Maintain field sanitation.")}
                 </div>
                 <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-lime-700 font-black text-sm">
                    <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
                    {t.safe}
                 </div>
              </div>

              {/* Chemical Plan */}
              <div className="glass p-8 space-y-6 border-l-8 border-l-red-500 bg-white/80">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center text-2xl">🧪</div>
                    <h3 className="text-2xl font-black text-slate-900">{t.chemical}</h3>
                 </div>
                 <div className="prose prose-slate max-w-none text-slate-900 font-medium leading-relaxed">
                    {data.recommendation?.treatment_data?.chemical || (lang === 'hi' ? 'स्थानीय प्रतिरोध के आधार पर विशिष्ट रासायनिक स्प्रे शेड्यूल के लिए स्थानीय कृषि विस्तार से परामर्श लें।' : "Consult local agricultural extension for specific chemical spray schedules based on local resistance.")}
                 </div>
                 <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-red-700 font-black text-sm">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    {t.efficacy}
                 </div>
              </div>
           </div>

           {/* AI Full Description */}
           {data.recommendation?.text && (
             <div className="p-10 rounded-3xl space-y-4 shadow-2xl relative overflow-hidden" style={{ background: '#0f172a' }}>
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32" style={{ background: 'rgba(5,150,105,0.1)' }} />
                <h3 className="text-xl font-black flex items-center gap-3 text-white">
                   <span className="text-emerald-400">AI</span> {t.advisory}
                </h3>
                <p className="leading-relaxed text-lg italic" style={{ color: '#cbd5e1' }}>
                  "{data.recommendation.text}"
                </p>
                <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase" style={{ color: '#64748b' }}>
                   Source: <span className="text-emerald-500">{data.recommendation.source?.toUpperCase()}</span> • Verified by Leaf Scan AI
                </div>
             </div>
           )}
        </div>

        {/* Prevention */}
        <div className="glass p-8 bg-emerald-50 border-2 border-emerald-100 flex flex-col md:flex-row gap-8 items-center">
           <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex-shrink-0 flex items-center justify-center text-4xl">🛡️</div>
           <div className="space-y-2">
              <h3 className="text-xl font-black text-emerald-900">{t.prevention}</h3>
              <p className="text-emerald-800/80 font-medium leading-relaxed">
                 {data.recommendation?.treatment_data?.prevention || (lang === 'hi' ? 'फसल रोटेशन लागू करें, हवा के प्रवाह के लिए उचित दूरी सुनिश्चित करें, और पत्तियों पर नमी को कम करने के लिए ओवरहेड सिंचाई से बचें।' : "Implement crop rotation, ensure proper spacing for airflow, and avoid overhead irrigation to minimize moisture on leaves.")}
              </p>
           </div>
        </div>
        {/* Chat Section */}
        <div className="glass rounded-3xl overflow-hidden border-2 border-emerald-100 shadow-xl bg-white/80">
          <div className="p-6 border-b border-emerald-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl">💬</div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Ask About This Disease</h3>
              <p className="text-slate-500 text-sm font-medium">Get expert AI advice specific to your diagnosis</p>
            </div>
          </div>

          <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
            {chatMessages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">🌿</p>
                <p className="text-slate-400 font-medium">{lang === 'hi' ? 'इस रोग के बारे में कुछ भी पूछें — उपचार, रोकथाम, लागत...' : 'Ask anything about this disease — treatment dosage, prevention, cost...'}</p>
              </div>
            )}

            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                {msg.role === 'ai' && (
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-lg">🤖</div>
                )}
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                }`}>
                  {msg.text}
                </div>
                {msg.role === 'user' && (
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 text-lg">🧑‍🌾</div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-lg">🤖</div>
                <div className="bg-slate-100 px-5 py-3 rounded-2xl rounded-tl-none border border-slate-200">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-emerald-100 flex gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !chatLoading && handleChatSend()}
              placeholder={lang === 'hi' ? 'जैसे: नीम का तेल कितना डालें?' : 'e.g. How much neem oil should I use?'}
              className="flex-1 px-5 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none font-medium text-slate-800 bg-white transition-colors"
            />
            <button
              onClick={handleChatSend}
              disabled={chatLoading || !chatInput.trim()}
              className="px-6 py-3.5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {lang === 'hi' ? 'भेजें' : 'Send'} <span className="text-lg">→</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center pt-8">
           <Link href="/scan">
              <button className="btn-premium px-12 py-5 text-xl">{t.another}</button>
           </Link>
        </div>
      </div>
    </main>
  );
}
