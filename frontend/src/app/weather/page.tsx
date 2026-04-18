"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function WeatherPage() {
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    // Simulate fetching weather data
    const timer = setTimeout(() => {
      setWeatherData({
        temperature: 28,
        humidity: 65,
        rainProbability: 20,
        waterSuggestion: "1 time per day",
        condition: "Partly Cloudy",
      });
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-[var(--bg-warm)] selection:bg-[var(--green-200)] relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[var(--accent-warm)] to-transparent rounded-full mix-blend-multiply filter blur-[100px] opacity-30 -translate-y-1/4 translate-x-1/4"></div>
      
      <nav className="w-full z-50 px-6 py-4 glass border-b border-[var(--glass-border)] sticky top-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <img src="/logo(leafscan).png" alt="LeafScan Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
            <span className="font-extrabold text-2xl tracking-tight text-[var(--text)]">
              Leaf<span className="text-[var(--primary)]">Scan</span>
            </span>
          </Link>

          {/* Links - Center */}
          <div className="hidden md:flex gap-8 items-center font-semibold text-[var(--text-secondary)]">
            <Link href="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
            <Link href="/#about" className="hover:text-[var(--primary)] transition-colors">About Us</Link>
            <Link href="/search" className="hover:text-[var(--primary)] transition-colors">Search</Link>
            <Link href="/history" className="hover:text-[var(--primary)] transition-colors">History</Link>
            <Link href="/weather" className="hover:text-[var(--primary)] transition-colors">Weather</Link>
          </div>

          {/* Login - Right */}
          <div className="flex items-center gap-3">
             <Link href="/login" className="btn-primary py-2 px-4 md:px-6 rounded-full text-xs md:text-sm whitespace-nowrap">
                <span className="hidden sm:inline">Login / Sign In</span>
                <span className="sm:hidden">Login</span>
             </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10 relative z-10 animate-fade-in-up">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text)] tracking-tight">Smart Weather Insights</h1>
          <p className="text-lg text-[var(--text-secondary)] font-medium max-w-2xl mx-auto">Get real-time weather conditions tailored for your farming needs and optimize your crop care routines.</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card h-48 rounded-[2rem]"></div>
            ))}
            <div className="md:col-span-3 glass-card h-32 rounded-[2rem]"></div>
          </div>
        ) : weatherData && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Temperature */}
              <div className="glass-premium p-8 text-center card-hover group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#fef3c7]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-16 h-16 bg-[#fef3c7] text-[#d97706] rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h3 className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-xs mb-2">Temperature</h3>
                <div className="text-5xl font-black text-[var(--text)]">{weatherData.temperature}°C</div>
                <p className="text-sm font-medium text-[var(--text-secondary)] mt-2">{weatherData.condition}</p>
              </div>

              {/* Humidity */}
              <div className="glass-premium p-8 text-center card-hover group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#e0f2fe]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-16 h-16 bg-[#e0f2fe] text-[#0284c7] rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h3 className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-xs mb-2">Humidity</h3>
                <div className="text-5xl font-black text-[var(--text)]">{weatherData.humidity}%</div>
                <p className="text-sm font-medium text-[var(--text-secondary)] mt-2">Optimal range</p>
              </div>

              {/* Rain Prediction */}
              <div className="glass-premium p-8 text-center card-hover group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#e0e7ff]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-16 h-16 bg-[#e0e7ff] text-[#4f46e5] rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v3m0-3l-2.5 2.5m2.5-2.5l2.5 2.5" /></svg>
                </div>
                <h3 className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-xs mb-2">Rain Probability</h3>
                <div className="text-5xl font-black text-[var(--text)]">{weatherData.rainProbability}%</div>
                <p className="text-sm font-medium text-[var(--text-secondary)] mt-2">Low chance of rain</p>
              </div>
            </div>

            {/* AI Suggestion */}
            <div className="glass-dark p-8 md:p-12 text-center rounded-[2.5rem] relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--primary)] via-[var(--green-300)] to-[var(--primary)]"></div>
              <div className="flex flex-col items-center justify-center space-y-4 relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center shadow-inner mb-2 animate-float">
                  <span className="text-3xl">🌱</span>
                </div>
                <h3 className="text-2xl font-extrabold text-white">Smart Watering Suggestion</h3>
                <p className="text-xl text-[var(--green-100)] font-medium max-w-xl">
                  Based on today's weather conditions, we recommend watering your plants <strong className="text-white font-black px-2 py-1 bg-white/20 rounded-lg">{weatherData.waterSuggestion}</strong> to maintain optimal soil moisture.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
