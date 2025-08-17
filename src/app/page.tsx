import Link from "next/link";
import FlowConnect from "@/components/flow-connect";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b1020] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <img src="/assets/omnipools_banner_inline.png" alt="OmniPools" className="mb-8 w-full rounded-2xl"/>
        
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">OmniPools — Flow Actions demo</h1>
          <div className="flex gap-2">
            <Link href="/create" className="rounded-xl bg-blue-500 px-4 py-2 hover:bg-blue-600">Create New</Link>
            <Link href="/pools" className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20">View Pools</Link>
            <Link href="/vault/1" className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20">Open Vault #1</Link>
            <Link href="/vault/2" className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20">Open Vault #2</Link>
          </div>
        </div>
        
        <p className="mb-6 text-white/70">Chain-abstracted payouts for events. Atomic, audit-ready.</p>
        
        <FlowConnect />
      </div>
    </main>
  );
}
