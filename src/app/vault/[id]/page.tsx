"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Card from "@/components/Card";

type Winner = { address: string; amount: string };
type Vault = {
  vaultId: number; org: string; name: string; description: string;
  status: string; lastOperationId: number; totalPaid: string;
  misses: Record<string,string>; winners: Winner[];
};

export default function VaultPage() {
  const params = useParams();
  const id = params.id || "1";
  const [data, setData] = useState<Vault | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setError(null);
    setLoading(true);
    fetch(`/data/vault-${id}.json?ts=${Date.now()}`)
      .then(r => { 
        if (!r.ok) throw new Error(String(r.status)); 
        return r.json(); 
      })
      .then(setData)
      .catch(e => setError(`Failed to load data: ${e.message}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, [id]);

  // Show skeleton for 300-500ms to avoid "stuck loading" when live-demoing
  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b1020] text-white">
        <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
          <div className="relative">
            <div className="w-full h-32 rounded-2xl bg-white/10 animate-pulse" />
            <div className="absolute inset-0 rounded-2xl bg-black/20" />
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-white/10 rounded animate-pulse w-1/2" />
            <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
            <div className="flex gap-2">
              <div className="h-6 bg-white/10 rounded-full animate-pulse w-20" />
              <div className="h-6 bg-white/10 rounded-full animate-pulse w-24" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#0b1020] text-white">
        <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-500/15 p-3 text-red-200 border border-red-500/30">
              {error}
            </div>
          )}
          <div className="text-center py-20">
            <p className="text-white/60 mb-4">No vault data available</p>
            <button 
              onClick={refresh} 
              className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20 text-white"
            >
              Refresh data
            </button>
          </div>
        </div>
      </main>
    );
  }

  const payoutCmd = `flow transactions send ./cadence/transactions/tx_payout_split.cdc ${data.org} ${data.vaultId}`;
  const statusColor = data.status === "Paid" ? "bg-emerald-500/20 text-emerald-200" : "bg-amber-500/20 text-amber-200";

  return (
    <main className="min-h-screen bg-[#0b1020] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
        {error && (
          <div className="rounded-xl bg-red-500/15 p-3 text-red-200 border border-red-500/30">
            {error}
          </div>
        )}
        
        <div className="relative">
          <img src="/assets/omnipools_banner_inline.png" alt="OmniPools" className="w-full rounded-2xl"/>
          <div className="absolute inset-0 rounded-2xl bg-black/20" />
        </div>
        
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">{data.name} <span className="text-white/50">#{data.vaultId}</span></h1>
          <p className="text-white/70">{data.description}</p>
          <div className="flex gap-2 flex-wrap">
            <span className={`rounded-full px-3 py-1 ${statusColor}`}>{data.status}</span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">opId: {data.lastOperationId}</span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">totalPaid: {data.totalPaid} USDC</span>
            <button 
              onClick={refresh} 
              className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20 text-white"
            >
              Refresh data
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Winners">
            <div className="space-y-2">
              {data.winners.map((w, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <code className="text-white/80">{w.address}</code>
                  <div className="font-medium">{w.amount} USDC</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Misses (weak guarantees)">
            {Object.keys(data.misses).length === 0 ? (
              <div className="text-white/60">None</div>
            ) : (
              <div className="space-y-2">
                {Object.entries(data.misses).map(([addr, amt]) => (
                  <div key={addr} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                    <code className="text-white/80">{addr}</code>
                    <div className="font-medium">{amt} USDC (skipped)</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Run payout (mock)">
            <p className="mb-3 text-white/70">This UI is read-only. Use the CLI to execute the Flow Action:</p>
            <pre className="overflow-auto rounded-xl bg-black/40 p-4 text-sm">{payoutCmd}</pre>
            <p className="mt-3 text-white/60">After running, refresh this page (data snapshots live in <code>/public/data</code>).</p>
          </Card>

          <Card title="Proof (summary)">
            <pre className="overflow-auto rounded-xl bg-black/40 p-4 text-xs">
{JSON.stringify({ status: data.status, lastOperationId: data.lastOperationId, totalPaid: data.totalPaid, misses: data.misses }, null, 2)}
            </pre>
          </Card>
        </div>
      </div>
    </main>
  );
} 