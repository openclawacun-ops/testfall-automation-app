import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/testfall-automation", label: "Dashboard", icon: "▦" },
  { href: "/testfall-automation/generator", label: "Generator", icon: "✦" },
  { href: "/testfall-automation/library", label: "Bibliothek", icon: "▤" },
];

export function TestForgeShell({ active, children }: { active: "dashboard" | "generator" | "library" | "detail"; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f4f3f8] text-slate-950 antialiased">
      <div className="grid min-h-screen lg:grid-cols-[288px_1fr]">
        <aside className="relative border-r border-slate-200 bg-white px-6 py-7 shadow-[12px_0_40px_rgba(79,70,229,0.05)] lg:sticky lg:top-0 lg:h-screen">
          <Link href="/testfall-automation" className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-600 text-xl text-white shadow-lg shadow-violet-200">⚗</span>
            <span>
              <span className="block text-xl font-bold tracking-[-0.03em] text-slate-950">TestForge</span>
              <span className="block text-sm font-medium text-slate-500">Testfall-Generator</span>
            </span>
          </Link>

          <nav className="mt-10 grid gap-2">
            {navItems.map((item) => {
              const itemActive = active !== "detail" && item.href.endsWith(active === "dashboard" ? "automation" : active);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${itemActive ? "bg-violet-600 text-white shadow-lg shadow-violet-100" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
                >
                  <span className={`grid h-8 w-8 place-items-center rounded-xl ${itemActive ? "bg-white/15" : "bg-slate-100 text-slate-500"}`}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-7 left-6 right-6 hidden lg:block">
            <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100" type="button" aria-disabled="true">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100">↩</span>
              Abmelden
            </button>
            <p className="mt-4 rounded-2xl bg-violet-50 px-4 py-3 text-xs leading-5 text-violet-700">Lokales MVP · keine externen Aktionen</p>
          </div>
        </aside>
        <section className="min-w-0 px-5 py-6 md:px-8 lg:px-10 lg:py-9">{children}</section>
      </div>
    </main>
  );
}

export function TestForgeHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-4xl font-bold tracking-[-0.045em] text-slate-950 md:text-5xl">{title}</h1>
        <p className="mt-2 text-base text-slate-500">{subtitle}</p>
      </div>
      {action}
    </header>
  );
}

export function PrimaryAction({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700">{children}</Link>;
}

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "violet" | "emerald" | "amber" | "rose" | "sky" | "slate" }) {
  const tones = {
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
  } as const;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${tones[tone]}`}>{children}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 ${className}`}>{children}</section>;
}
