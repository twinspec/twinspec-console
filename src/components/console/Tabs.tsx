"use client";

import { useState } from "react";

export function Tabs({
  tabs,
  defaultTabId,
}: {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
  defaultTabId: string;
}) {
  const [active, setActive] = useState(defaultTabId);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={[
                "rounded-xl px-3 py-2 text-sm",
                isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4">{current.content}</div>
    </div>
  );
}