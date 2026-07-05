import Link from "next/link";
import { experiments } from "@/lib/constants";

export default function Home() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-[18px] font-bold tracking-tight text-zinc-50">
          Platform Overview
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Active interactive physics and mathematics experiments.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#161b2e] border border-white/5 rounded-lg p-5">
          <div className="text-[11px] font-medium uppercase tracking-widest text-zinc-400 mb-2">Total Labs</div>
          <div className="text-[22px] font-bold tracking-tight text-zinc-50">{experiments.length}</div>
          <div className="text-[11px] text-zinc-400 mt-1">Active Modules</div>
        </div>
        <div className="bg-[#161b2e] border border-white/5 rounded-lg p-5">
          <div className="text-[11px] font-medium uppercase tracking-widest text-zinc-400 mb-2">Engine</div>
          <div className="text-[22px] font-bold tracking-tight text-zinc-50">Next.js 14</div>
          <div className="text-[11px] text-zinc-400 mt-1">React + Tailwind</div>
        </div>
        <div className="bg-[#161b2e] border border-white/5 rounded-lg p-5">
          <div className="text-[11px] font-medium uppercase tracking-widest text-zinc-400 mb-2">Performance</div>
          <div className="text-[22px] font-bold tracking-tight text-zinc-50">60 FPS</div>
          <div className="text-[11px] text-zinc-400 mt-1">Target render rate</div>
        </div>
        <div className="bg-[#161b2e] border border-white/5 rounded-lg p-5">
          <div className="text-[11px] font-medium uppercase tracking-widest text-zinc-400 mb-2">Physics Mode</div>
          <div className="text-[22px] font-bold tracking-tight text-zinc-50">Enabled</div>
          <div className="text-[11px] text-zinc-400 mt-1">Real-time simulation</div>
        </div>
      </div>

      <div className="bg-[#161b2e] border border-white/5 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr>
                <th className="sticky top-0 bg-[#1c2237] p-3 text-zinc-400 font-semibold uppercase tracking-widest border-b border-white/5">Experiment</th>
                <th className="sticky top-0 bg-[#1c2237] p-3 text-zinc-400 font-semibold uppercase tracking-widest border-b border-white/5">Description</th>
                <th className="sticky top-0 bg-[#1c2237] p-3 text-zinc-400 font-semibold uppercase tracking-widest border-b border-white/5">Status</th>
              </tr>
            </thead>
            <tbody>
              {experiments.map((exp) => (
                <tr key={exp.id} className="border-b border-white-[0.04] transition-colors hover:bg-zinc-800/50 last:border-0 group">
                  <td className="p-3">
                    <Link href={exp.href} className="font-semibold text-blue-400 hover:underline">
                      {exp.name}
                    </Link>
                  </td>
                  <td className="p-3 text-zinc-50">
                    {exp.description}
                  </td>
                  <td className="p-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-blue-400/15 text-blue-400">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
