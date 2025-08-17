'use client'

import { useEffect, useState } from 'react'
import { useNetwork } from '@/lib/contexts/network-context'

export default function PWAInstaller() {
  const { isAuthenticated } = useNetwork()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [userDecision, setUserDecision] = useState<'dismissed' | 'installed' | null>(null)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error)
        })
    }

    // Load user decision from localStorage
    const savedDecision = localStorage.getItem('pwa-user-decision') as 'dismissed' | 'installed' | null
    setUserDecision(savedDecision)

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('📱 PWA install prompt available')
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show prompt only if user hasn't made a permanent decision
      if (!savedDecision) {
        setShowInstallPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Reset banner visibility when user disconnects wallet
  useEffect(() => {
    if (!isAuthenticated && userDecision === 'dismissed') {
      // User disconnected - reset their decision so banner can show again
      setUserDecision(null)
      localStorage.removeItem('pwa-user-decision')
      
      // If we have a deferred prompt, show the banner again
      if (deferredPrompt) {
        setShowInstallPrompt(true)
      }
    }
  }, [isAuthenticated, userDecision, deferredPrompt])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        console.log(`📱 User response to install prompt: ${outcome}`)
        
        if (outcome === 'accepted') {
          console.log('✅ PWA installation accepted')
          localStorage.setItem('pwa-user-decision', 'installed')
          setUserDecision('installed')
        } else {
          console.log('❌ PWA installation declined')
          localStorage.setItem('pwa-user-decision', 'dismissed')
          setUserDecision('dismissed')
        }
      } catch (error) {
        console.error('❌ PWA install failed:', error)
      } finally {
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
      }
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-user-decision', 'dismissed')
    setUserDecision('dismissed')
    setShowInstallPrompt(false)
  }

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white shadow-xl md:left-auto md:right-4 md:w-96 safe-area-bottom">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📱</span>
            <h3 className="text-lg font-bold">Install TrustFlow</h3>
          </div>
          <p className="text-base text-blue-100 leading-relaxed">Add to your home screen for quick access and native app experience</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleDismiss}
            className="flex-1 sm:flex-none rounded-xl bg-blue-500/50 px-4 py-3 text-base font-medium hover:bg-blue-500/70 transition-all min-h-[48px]"
          >
            Later
          </button>
          <button
            onClick={handleInstallClick}
            className="flex-1 sm:flex-none rounded-xl bg-white px-4 py-3 text-base font-bold text-blue-600 hover:bg-blue-50 transition-all min-h-[48px] shadow-lg"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-lg">⬇️</span>
              Install
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}