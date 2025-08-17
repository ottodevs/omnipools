import CryptoJS from 'crypto-js'

export interface ImageMetadata {
  imageSVG?: string
  imageURL?: string
  imageHash?: string
}

const MAX_SVG_SIZE = 24 * 1024 // 24KB

export function calculateSHA256(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer
      const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer)
      const hash = CryptoJS.SHA256(wordArray)
      resolve(hash.toString(CryptoJS.enc.Hex))
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export async function processImageFile(file: File): Promise<ImageMetadata> {
  const isSVG = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
  
  if (isSVG && file.size <= MAX_SVG_SIZE) {
    // Store SVG inline
    const svgContent = await file.text()
    return {
      imageSVG: svgContent
    }
  } else {
    // Store as URL + hash
    const hash = await calculateSHA256(file)
    
    // For demo purposes, we'll use a placeholder URL
    // In production, you'd upload to IPFS, Arweave, or other storage
    const imageURL = `https://placeholder-storage.com/${hash}`
    
    return {
      imageURL,
      imageHash: hash
    }
  }
}

export function validateImageFile(file: File): string | null {
  const maxSize = 10 * 1024 * 1024 // 10MB max
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  
  if (!allowedTypes.includes(file.type)) {
    return 'Please select a valid image file (JPEG, PNG, GIF, WebP, or SVG)'
  }
  
  if (file.size > maxSize) {
    return 'Image file must be smaller than 10MB'
  }
  
  return null
}