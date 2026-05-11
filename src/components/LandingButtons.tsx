'use client'

import { useClerk, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function LandingButtons() {
  const { openSignIn } = useClerk();

  return (
    <>
      <SignedIn>
        <Link
          href="/dashboard"
          className="px-6 py-2 border border-[#ECE8E1]/20 hover:border-[#FF4655] transition-all duration-300 font-bold uppercase tracking-widest text-sm"
        >
          Dashboard
        </Link>
      </SignedIn>
      <SignedOut>
        <button
          onClick={() => openSignIn({ forceRedirectUrl: '/dashboard' })}
          className="group relative px-6 py-2 bg-[#FF4655] hover:bg-[#ff5e6a] uppercase font-black tracking-widest text-lg transition-all duration-300 overflow-hidden cursor-pointer"
        >
          Login
        </button>
      </SignedOut>
    </>
  );
}

export function HeroButton() {
  const { openSignIn } = useClerk();

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      <SignedIn>
        <Link
          href="/dashboard"
          className="group relative px-10 py-5 bg-[#FF4655] hover:bg-[#ff5e6a] transition-all duration-300 overflow-hidden"
        >
          <div className="relative z-10 flex items-center gap-3">
            <span className="font-black uppercase tracking-widest text-lg">Enter Dashboard</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </Link>
      </SignedIn>
      <SignedOut>
        <button
          onClick={() => openSignIn({ forceRedirectUrl: '/dashboard' })}
          className="group relative px-10 py-5 bg-[#FF4655] hover:bg-[#ff5e6a] transition-all duration-300 overflow-hidden cursor-pointer"
        >
          <div className="relative z-10 flex items-center gap-3">
            <span className="font-black uppercase tracking-widest italic text-lg">Start Tracking</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </SignedOut>
    </div>
  );
}
