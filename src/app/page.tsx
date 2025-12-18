import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">TwinSpec Console</h1>
      <p className="mt-3 text-slate-600">
        This repo contains the lab console shell with an instrument console and a data viewer.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/console"
          className="rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
        >
          Open Console
        </Link>
      </div>
    </main>
  );
}