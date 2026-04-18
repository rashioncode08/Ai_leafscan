"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, setToken } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    language_pref: "en",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.email && !formData.phone) {
        throw new Error("Please provide either email or phone");
      }

      const res = await registerUser(formData);
      if (res.token) {
        setToken(res.token);
        window.dispatchEvent(new Event("auth-change"));
        router.push("/history");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen mesh-bg flex items-center justify-center p-6 py-16 selection:bg-[var(--green-200)]">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo */}
        <div className="text-center space-y-4">
           <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 bg-[var(--primary)] rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
           </Link>
           <div className="space-y-1">
             <h1 className="text-3xl font-black text-[var(--text)] tracking-tight">Create Account</h1>
             <p className="text-[var(--text-secondary)] font-bold">Join the Leaf Scan agricultural community</p>
           </div>
        </div>

        {/* Form Card */}
        <div className="glass p-10 space-y-8 shadow-2xl bg-white/60">
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-start gap-3 animate-shake">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--green-100)] bg-white/50 focus:border-[var(--primary)] focus:bg-white outline-none transition-all font-bold text-[var(--text)]"
                placeholder="Ramesh Kumar"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--green-100)] bg-white/50 focus:border-[var(--primary)] focus:bg-white outline-none transition-all font-bold text-[var(--text)]"
                placeholder="farmer@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--green-100)] bg-white/50 focus:border-[var(--primary)] focus:bg-white outline-none transition-all font-bold text-[var(--text)]"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--green-100)] bg-white/50 focus:border-[var(--primary)] focus:bg-white outline-none transition-all font-bold text-[var(--text)]"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Language</label>
              <select
                name="language_pref"
                value={formData.language_pref}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--green-100)] bg-white/50 focus:border-[var(--primary)] focus:bg-white outline-none transition-all font-bold text-[var(--text)] appearance-none cursor-pointer"
              >
                <option value="en">English (Global)</option>
                <option value="hi">हिन्दी (India)</option>
              </select>
            </div>

            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-premium w-full py-5 text-lg flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    CREATE FREE ACCOUNT
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center font-bold text-[var(--text-secondary)] pb-10">
          Already using Leaf Scan?{" "}
          <Link href="/login" className="text-[var(--primary)] hover:text-[var(--primary-dark)] border-b-2 border-[var(--green-100)] hover:border-[var(--primary)] transition-all">
            Sign in here
          </Link>
        </p>
      </div>
    </main>
  );
}
