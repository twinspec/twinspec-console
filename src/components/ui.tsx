"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useInstrumentStore, InteractionIntent } from "@/state/instrumentStore";

export function Card({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-xl2 border border-border bg-surface shadow-card", className)}>
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

export function Button({
  className,
  children,
  onClick,
  variant = "default",
  intent = "click",
  disabled
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "ghost";
  intent?: InteractionIntent;
  disabled?: boolean;
}) {
  const setInteraction = useInstrumentStore((s) => s.setLastInteraction);

  const base =
    "inline-flex items-center justify-center rounded-xl2 px-3 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-primary text-white hover:opacity-90"
      : variant === "ghost"
        ? "bg-transparent hover:bg-surface2 border border-border"
        : "bg-surface2 hover:opacity-90 border border-border";

  return (
    <button
      className={cn(base, styles, className)}
      disabled={disabled}
      onClick={() => {
        setInteraction({ intent, source: "button" });
        onClick?.();
      }}
      type="button"
    >
      {children}
    </button>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-medium text-muted">{children}</div>;
}

export function Input({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl2 border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
    />
  );
}

export function Select({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl2 border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}