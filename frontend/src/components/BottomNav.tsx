"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = () => setIsAuth(!!localStorage.getItem("kisan_token"));
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, []);

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: "Search",
      path: "/search",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      name: "Scan",
      path: "/#scan",
      isFab: true,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      name: "My Area",
      path: "/farm",
      isFab: true,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    {
      name: "Weather",
      path: "/weather",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v3m0-3l-2.5 2.5m2.5-2.5l2.5 2.5" />
        </svg>
      )
    },
    {
      name: "History",
      path: "/history",
      hideWhenLoggedOut: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-[env(safe-area-inset-bottom)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] font-[family-name:var(--font-poppins)]">
      <div className="flex justify-between items-center py-2 px-1">
        {navItems.map((item, i) => {
          if (item.hideWhenLoggedOut && !isAuth) return null;
          
          const isActive = pathname === item.path || (item.path === "/#scan" && pathname === "/");
          
          if (item.isFab) {
            return (
              <div key={i} className="flex flex-col items-center justify-center -mt-5">
                <Link 
                  href={item.path} 
                  className="w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center shadow-[0_8px_20px_rgba(16,185,129,0.4)] border-[3px] border-white dark:border-slate-900 transform transition-transform active:scale-95"
                >
                  {item.icon}
                </Link>
                <span className="text-[9px] font-bold mt-1 text-[var(--text-secondary)] whitespace-nowrap">{item.name}</span>
              </div>
            );
          }

          return (
            <Link key={i} href={item.path} className="flex flex-col items-center justify-center w-12 gap-1 p-0.5">
              <div className={`transition-colors duration-300 ${isActive ? "text-[var(--primary)]" : "text-slate-400 dark:text-slate-500"}`}>
                {item.icon}
              </div>
              <span className={`text-[9px] font-semibold transition-colors duration-300 ${isActive ? "text-[var(--primary)]" : "text-slate-400 dark:text-slate-500"} whitespace-nowrap`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
