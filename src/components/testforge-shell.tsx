import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/testfall-automation", label: "Dashboard", icon: "▦" },
  { href: "/testfall-automation/generator", label: "Generator", icon: "✦" },
  { href: "/testfall-automation/library", label: "Bibliothek", icon: "▤" },
];

export function TestForgeShell({ active, children }: { active: "dashboard" | "generator" | "library" | "detail"; children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f8fafc_0%,#edf3f8_42%,#f7fafc_100%)] text-slate-950 antialiased">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(56,189,248,0.18),transparent_28rem),radial-gradient(circle_at_84%_12%,rgba(148,163,184,0.20),transparent_26rem),radial-gradient(circle_at_68%_84%,rgba(15,23,42,0.07),transparent_30rem)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(15,23,42,.55)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,.55)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative grid min-h-screen lg:grid-cols-[292px_1fr]">
        <aside className="relative border-r border-white/80 bg-white/62 px-6 py-7 shadow-[24px_0_90px_rgba(15,23,42,0.08)] backdrop-blur-3xl lg:sticky lg:top-0 lg:h-screen">
          <Link href="/testfall-automation" className="group flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-[18px] bg-slate-950 text-xl text-white shadow-[0_18px_48px_rgba(15,23,42,0.24)] ring-1 ring-white/50 transition group-hover:-translate-y-0.5">⚗</span>
            <span>
              <span className="block text-xl font-semibold tracking-[-0.04em] text-slate-950">TestForge</span>
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
                  className={`flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-semibold transition duration-200 ${itemActive ? "bg-slate-950 text-white shadow-[0_18px_42px_rgba(15,23,42,0.20)]" : "text-slate-600 hover:-translate-y-0.5 hover:bg-white/78 hover:text-slate-950 hover:shadow-[0_14px_34px_rgba(15,23,42,0.07)]"}`}
                >
                  <span className={`grid h-8 w-8 place-items-center rounded-xl ${itemActive ? "bg-white/14 text-white" : "bg-white/86 text-slate-500 shadow-sm ring-1 ring-slate-950/[0.03]"}`}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-7 left-6 right-6 hidden lg:block">
            <button className="flex w-full items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-white/72 hover:text-slate-800 hover:shadow-sm" type="button" aria-disabled="true">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/86 shadow-sm ring-1 ring-slate-950/[0.03]">↩</span>
              Abmelden
            </button>
            <p className="mt-4 rounded-[22px] border border-white/80 bg-white/58 px-4 py-3 text-xs leading-5 text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-2xl">Lokales MVP · keine externen Aktionen</p>
          </div>
        </aside>
        <section className="min-w-0 px-5 py-6 md:px-8 lg:px-10 lg:py-9">{children}</section>
      </div>
    </main>
  );
}

export function TestForgeHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-5 rounded-[34px] border border-white/80 bg-white/54 p-5 shadow-[0_28px_90px_rgba(15,23,42,0.08)] backdrop-blur-3xl md:flex-row md:items-center md:justify-between">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">TestForge</p>
        <h1 className="text-4xl font-semibold tracking-[-0.065em] text-slate-950 md:text-5xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-base font-medium leading-6 text-slate-500">{subtitle}</p>
      </div>
      {action}
    </header>
  );
}

export function PrimaryAction({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex items-center justify-center rounded-[20px] bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-[0_22px_52px_rgba(15,23,42,0.24)] ring-1 ring-white/20 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800">{children}</Link>;
}

export function SecondaryAction({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex items-center justify-center rounded-[20px] border border-white/80 bg-white/70 px-5 py-3 text-sm font-bold text-slate-700 shadow-[0_14px_38px_rgba(15,23,42,0.07)] backdrop-blur-2xl transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-slate-950">{children}</Link>;
}

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "violet" | "emerald" | "amber" | "rose" | "sky" | "slate" }) {
  const tones = {
    violet: "bg-slate-950 text-white ring-slate-900/10",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    slate: "bg-white/76 text-slate-600 ring-slate-200/80",
  } as const;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 backdrop-blur-xl ${tones[tone]}`}>{children}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[30px] border border-white/80 bg-white/66 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-3xl ring-1 ring-slate-950/[0.025] ${className}`}>{children}</section>;
}
