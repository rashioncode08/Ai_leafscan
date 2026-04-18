"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [diseases, setDiseases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/api/diseases?search=${query}`);
        const data = await res.json();
        setDiseases(data.diseases || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchDiseases();
    }, 300); // debounce search
    
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <main 
      className="min-h-screen relative bg-cover bg-fixed bg-center"
      style={{ backgroundImage: "url('/0cad129d9c0d34eaac50302009a2360c.jpg')" }}
    >
      <div className="absolute inset-0 bg-[var(--bg)]/80 backdrop-blur-sm z-0"></div>
      <div className="relative z-10">

      <div className="max-w-4xl mx-auto px-6 py-28 space-y-8 animate-fade-in-up">
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
          {loading ? (
            <div className="text-center py-12 text-[var(--text-secondary)] font-semibold animate-pulse">Loading diseases...</div>
          ) : diseases.length > 0 ? (
            diseases.map((disease) => (
              <div key={disease.id} className="glass-card p-6 pb-8 md:p-8 card-hover relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-[var(--primary)] group-hover:bg-[var(--primary-light)] transition-colors"></div>
                <h3 className="text-2xl font-bold text-[var(--text)] mb-4">{disease.name}</h3>
                <div className="space-y-4">
                  {disease.symptoms && (
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Symptoms</h4>
                      <p className="text-[var(--text-secondary)] font-medium">{disease.symptoms}</p>
                    </div>
                  )}
                  {disease.treatment && (
                    <div>
                      <h4 className="text-sm font-bold text-[var(--primary-dark)] uppercase tracking-wider mb-1">Treatment Plan</h4>
                      <div className="p-4 bg-[var(--green-50)] border border-[var(--green-100)] rounded-xl font-medium text-[var(--green-900)]">
                        {disease.treatment}
                      </div>
                    </div>
                  )}
                  {disease.prevention && (
                    <div>
                      <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Prevention</h4>
                      <p className="text-[var(--text-secondary)] font-medium">{disease.prevention}</p>
                    </div>
                  )}
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
