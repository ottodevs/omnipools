import { ReactNode } from "react";

export default function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 lg:p-8 shadow-lg backdrop-blur-md">
      <div className="mb-4 sm:mb-6 text-base sm:text-lg font-bold tracking-wide text-white">{title}</div>
      {children}
    </div>
  );
} 