'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-[#0b1020]/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image 
              src="/assets/logo-square.svg" 
              alt="OmniPools" 
              width={32} 
              height={32}
              className="rounded-lg"
            />
            <span className="text-lg font-semibold text-white">OmniPools</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/create" 
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              Create
            </Link>
            <Link 
              href="/pools" 
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              Pools
            </Link>
            <Link 
              href="/vault/1" 
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              Vault #1
            </Link>
            <Link 
              href="/vault/2" 
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              Vault #2
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4">
            <div className="flex flex-col gap-3">
              <Link 
                href="/create" 
                className="text-sm text-white/80 hover:text-white transition-colors px-2 py-1 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Create
              </Link>
              <Link 
                href="/pools" 
                className="text-sm text-white/80 hover:text-white transition-colors px-2 py-1 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Pools
              </Link>
              <Link 
                href="/vault/1" 
                className="text-sm text-white/80 hover:text-white transition-colors px-2 py-1 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Vault #1
              </Link>
              <Link 
                href="/vault/2" 
                className="text-sm text-white/80 hover:text-white transition-colors px-2 py-1 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Vault #2
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 