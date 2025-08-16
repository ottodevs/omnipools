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

  useEffect(() => {
    fetch(`/data/vault-${id}.json`).then(r => r.json()).then(setData).catch(() => setData(null));
  }, [id]);

  const refreshData = () => {
    fetch(`/data/vault-${id}.json?ts=${Date.now()}`).then(r => r.json()).then(setData).catch(() => setData(null));
  };

  if (!data) return <div className="p-8">Loading...</div>;

  const payoutCmd = `flow transactions send ./cadence/transactions/tx_payout_split.cdc ${data.org} ${data.vaultId}`;

  return (
    <main className="min-h-screen bg-[#0b1020] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
        <img src="/assets/omnipools_banner_inline.png" alt="OmniPools" className="w-full rounded-2xl"/>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">{data.name} <span className="text-white/50">#{data.vaultId}</span></h1>
          <p className="text-white/70">{data.description}</p>
          <div className="flex gap-2">
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-200">{data.status}</span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">opId: {data.lastOperationId}</span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">totalPaid: {data.totalPaid} USDC</span>
            <button onClick={refreshData} className="rounded-full bg-blue-500/20 px-3 py-1 text-blue-200 hover:bg-blue-500/30">Refresh</button>
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