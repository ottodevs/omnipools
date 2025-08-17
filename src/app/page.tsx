'use client'

import Link from "next/link";
import FlowConnect from "@/components/flow-connect";
import Onboarding from "@/components/onboarding";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";

export default function Home() {
  const { hasCompletedOnboarding } = useOnboardingStore()

  if (!hasCompletedOnboarding) {
    return <Onboarding />
  }
  return (
    <main className="min-h-screen bg-[#0b1020] text-white safe-area-top">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-10">
        {/* Hero Banner - Mobile optimized */}
        <div className="mb-6 sm:mb-8">
          <img 
            src="/assets/omnipools_banner_inline.png" 
            alt="TrustFlow" 
            className="w-full rounded-2xl"
          />
        </div>
        
        {/* Mobile-first header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            TrustFlow
          </h1>
          <p className="text-lg sm:text-xl text-blue-400 mb-4">
            Flow Actions Demo
          </p>
          <p className="text-base sm:text-lg text-white/70 leading-relaxed">
            Chain-abstracted payouts for events. Atomic, audit-ready.
          </p>
        </div>
        
        {/* Mobile-first action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Link 
            href="/create" 
            className="flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-center text-base sm:text-lg font-semibold text-white shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            ✨ Create New
          </Link>
          
          <Link 
            href="/pools" 
            className="flex items-center justify-center rounded-2xl bg-white/10 px-6 py-4 text-center text-base sm:text-lg font-semibold text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            🏊‍♂️ View Pools
          </Link>
          
          <Link 
            href="/vault/1" 
            className="flex items-center justify-center rounded-2xl bg-white/10 px-6 py-4 text-center text-base sm:text-lg font-semibold text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            🏛️ Vault #1
          </Link>
          
          <Link 
            href="/vault/2" 
            className="flex items-center justify-center rounded-2xl bg-white/10 px-6 py-4 text-center text-base sm:text-lg font-semibold text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            🏛️ Vault #2
          </Link>
        </div>
        
        {/* Flow Connect - Mobile optimized */}
        <div className="mb-6 safe-area-bottom">
          <FlowConnect />
        </div>
      </div>
    </main>
  );
}
