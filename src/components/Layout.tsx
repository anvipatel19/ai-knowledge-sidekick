import type { ReactNode } from 'react';

interface LayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
}

export function Layout({ sidebar, main }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#060e1f] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-row border-x border-[#111a2c]">
        <aside className="flex-[0_0_25%] border-r border-[#1b2740] bg-[#0c172c] px-6 py-8">
          <div className="mx-auto max-w-[260px]">{sidebar}</div>
        </aside>
        <main className="flex-[0_0_75%] bg-[#0f1d36]">{main}</main>
      </div>
    </div>
  );
}
