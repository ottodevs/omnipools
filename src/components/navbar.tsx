'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-[#0b1020]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 safe-area-top">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Mobile optimized */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity min-h-[48px]">
            <Image 
              src="/assets/logo-square.svg" 
              alt="TrustFlow" 
              width={36} 
              height={36}
              className="rounded-lg"
            />
            <span className="text-lg sm:text-xl font-bold text-white">TrustFlow</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link 
              href="/create" 
              className="text-base font-medium text-white/80 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/10"
            >
              Create
            </Link>
            <Link 
              href="/pools" 
              className="text-base font-medium text-white/80 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/10"
            >
              Pools
            </Link>
            <Link 
              href="/vault/1" 
              className="text-base font-medium text-white/80 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/10"
            >
              Vault #1
            </Link>
            <Link 
              href="/vault/2" 
              className="text-base font-medium text-white/80 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/10"
            >
              Vault #2
            </Link>
          </div>

          {/* Mobile Menu Button - Larger touch target */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden flex items-center justify-center w-12 h-12 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu - Improved spacing and touch targets */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-white/10">
            <div className="flex flex-col space-y-2 pt-4">
              <Link 
                href="/create" 
                className="text-white/80 hover:text-white hover:bg-white/10 transition-all py-4 px-4 rounded-xl text-lg font-medium flex items-center gap-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-xl">✨</span>
                Create Pool
              </Link>
              <Link 
                href="/pools" 
                className="text-white/80 hover:text-white hover:bg-white/10 transition-all py-4 px-4 rounded-xl text-lg font-medium flex items-center gap-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-xl">🏊‍♂️</span>
                View Pools
              </Link>
              <Link 
                href="/vault/1" 
                className="text-white/80 hover:text-white hover:bg-white/10 transition-all py-4 px-4 rounded-xl text-lg font-medium flex items-center gap-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-xl">🏛️</span>
                Vault #1
              </Link>
              <Link 
                href="/vault/2" 
                className="text-white/80 hover:text-white hover:bg-white/10 transition-all py-4 px-4 rounded-xl text-lg font-medium flex items-center gap-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-xl">🏛️</span>
                Vault #2
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 