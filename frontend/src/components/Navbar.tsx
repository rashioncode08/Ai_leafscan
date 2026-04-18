"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = () => setIsAuth(!!localStorage.getItem("kisan_token"));
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, []);

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 px-4 flex justify-center transition-all duration-500 font-[family-name:var(--font-poppins)]">
      <div className="max-w-6xl w-full mx-auto flex justify-between items-center bg-white/75 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-full px-6 py-3">
        {/* Logo - Left */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
          <img src="/logo(leafscan).png" alt="LeafScan Logo" className="w-10 h-10 object-contain group-hover:scale-110 group-hover:rotate-[15deg] transition-all duration-300" />
          <span className="font-extrabold text-2xl tracking-tight text-[var(--text)] font-[family-name:var(--font-outfit)]">
            Leaf<span className="text-[var(--primary)]">Scan</span>
          </span>
        </Link>

        {/* Links - Center */}
        <div className="hidden md:flex gap-8 items-center font-medium text-[15px] text-[var(--text-secondary)]">
          <Link href="/" className="relative hover:text-[var(--primary)] transition-colors group py-1">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <a href="/#about" className="relative hover:text-[var(--primary)] transition-colors group py-1">
            About Us
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full"></span>
          </a>
          <Link href="/search" className="relative hover:text-[var(--primary)] transition-colors group py-1">
            Search
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/weather" className="relative hover:text-[var(--primary)] transition-colors group py-1">
            Weather
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          {isAuth && (
            <>
              <Link href="/history" className="relative hover:text-[var(--primary)] transition-colors group py-1">
                History
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/farm" className="relative hover:text-[var(--primary)] transition-colors group py-1">
                My Area
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </>
          )}
        </div>

        {/* Login - Right */}
        <div className="flex items-center gap-2">
          {isAuth ? (
            <div className="flex items-center gap-2">
              <Link href="/profile" className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[var(--primary)] w-10 h-10 md:w-auto md:px-6 md:py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:bg-[var(--primary-dark)]">
                <svg className="w-5 h-5 text-green-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="hidden md:inline md:ml-2">Profile</span>
              </Link>
              <button 
                onClick={() => {
                  localStorage.removeItem("kisan_token");
                  window.dispatchEvent(new Event("auth-change"));
                }}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-red-100 w-10 h-10 md:w-auto md:px-4 md:py-2.5 text-sm font-semibold text-red-600 shadow-md transition-all hover:scale-105 hover:bg-red-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span className="hidden md:inline md:ml-2">Logout</span>
              </button>
            </div>
          ) : (
            <Link href="/login" className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] w-10 h-10 md:w-auto md:px-6 md:py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2">
              <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
              <svg className="w-5 h-5 text-green-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4a8 8 0 018-8h4m0 0l-4-4m4 4l-4 4" />
              </svg>
              <span className="hidden md:inline md:ml-2">Login / Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
