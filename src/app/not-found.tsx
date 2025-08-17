import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0b1020] text-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-white/20">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-white/60 max-w-md">
          The page you're looking for doesn't exist. Here are some helpful links:
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/" 
            className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20 text-white transition-colors"
          >
            Home
          </Link>
          <Link 
            href="/pools" 
            className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20 text-white transition-colors"
          >
            Pools
          </Link>
        </div>
      </div>
    </main>
  )
} 