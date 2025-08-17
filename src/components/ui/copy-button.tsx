'use client'

import { useState } from 'react'

interface CopyButtonProps {
  text: string
  className?: string
}

export default function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
        copied
          ? 'bg-green-500/20 text-green-200'
          : 'bg-white/10 text-white/80 hover:bg-white/20'
      } ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <span>✓</span>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <span>📋</span>
          <span>Copy</span>
        </>
      )}
    </button>
  )
} 