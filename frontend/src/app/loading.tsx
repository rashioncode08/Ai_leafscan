import React from "react";
import Loader from "@/components/Loader";

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md">
      <Loader />
      <p className="mt-8 text-emerald-400 font-bold text-xl animate-pulse tracking-wide">
        Loading...
      </p>
    </div>
  );
}
