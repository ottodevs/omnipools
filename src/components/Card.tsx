import { ReactNode } from "react";

export default function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur">
      <div className="mb-3 text-sm uppercase tracking-wide text-white/70">{title}</div>
      {children}
    </div>
  );
} 