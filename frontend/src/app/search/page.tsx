"use client";

import { useState } from "react";
import Link from "next/link";

const MOCK_DISEASES = [
  {
    id: 1,
    name: "Tomato Early Blight",
    symptoms: "Brown spots with concentric rings on lower leaves. Yellowing of leaves.",
    treatment: "Apply copper-based fungicides. Ensure proper spacing for airflow.",
  },
  {
    id: 2,
    name: "Powdery Mildew",
    symptoms: "White, powdery fungal spots on leaves and stems. Leaves may twist and distort.",
    treatment: "Use neem oil or sulfur-based organic sprays. Avoid overhead watering.",
  },
  {
    id: 3,
    name: "Potato Late Blight",
    symptoms: "Water-soaked dark lesions on leaves, white fungal growth on undersides in humid conditions.",
    treatment: "Remove infected plants immediately. Apply protective fungicides before infection spreads.",
  },
  {
    id: 4,
    name: "Citrus Canker",
    symptoms: "Raised, corky lesions with yellow halos on leaves, stems, and fruit.",
    treatment: "Prune infected branches. Apply copper bactericide during growing season.",
  }
];

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const filteredDiseases = MOCK_DISEASES.filter(d => 
    d.name.toLowerCase().includes(query.toLowerCase()) || 
    d.symptoms.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main 
      className="min-h-screen relative bg-cover bg-fixed bg-center"
      style={{ backgroundImage: "url('/0cad129d9c0d34eaac50302009a2360c.jpg')" }}
    >
      <div className="absolute inset-0 bg-[var(--bg)]/80 backdrop-blur-sm z-0"></div>
      <div className="relative z-10">
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

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-fade-in-up">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-[var(--text)] tracking-tight">Search Diseases</h1>
          <p className="text-lg text-[var(--text-secondary)] font-medium">Find information on crop diseases, symptoms, and treatments.</p>
        </div>

        {/* Search Bar */}
        <div className="relative group max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-4 flex items-center text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-5 rounded-[2rem] border-2 border-[var(--green-100)] bg-white/60 focus:border-[var(--primary)] focus:bg-white outline-none transition-all font-bold text-[var(--text)] text-lg shadow-[var(--glass-shadow)]"
            placeholder="Search for a disease or symptom..."
          />
        </div>

        {/* Results */}
        <div className="space-y-6 pt-4 pb-12">
          {filteredDiseases.length > 0 ? (
            filteredDiseases.map((disease) => (
              <div key={disease.id} className="glass-card p-6 pb-8 md:p-8 card-hover relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-[var(--primary)] group-hover:bg-[var(--primary-light)] transition-colors"></div>
                <h3 className="text-2xl font-bold text-[var(--text)] mb-4">{disease.name}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Symptoms</h4>
                    <p className="text-[var(--text-secondary)] font-medium">{disease.symptoms}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--primary-dark)] uppercase tracking-wider mb-1">Treatment Plan</h4>
                    <div className="p-4 bg-[var(--green-50)] border border-[var(--green-100)] rounded-xl font-medium text-[var(--green-900)]">
                      {disease.treatment}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 glass rounded-[2rem]">
              <div className="w-20 h-20 bg-[var(--earth-100)] text-[var(--earth-400)] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--text)]">No diseases found</h3>
              <p className="text-[var(--text-muted)] font-medium mt-2">Try adjusting your search terms.</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </main>
  );
}
