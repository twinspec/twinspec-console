import { Card, CardBody } from "@/components/ui";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">TwinSpec</h1>
        <p className="mt-1 text-sm text-muted">
          Home (stub). Use <span className="font-mono">/app/console</span> for the instrument and{" "}
          <span className="font-mono">/app/data</span> for the catalog.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardBody>
            <div className="text-sm font-medium">Instrument Console</div>
            <div className="mt-1 text-sm text-muted">
              Dataset-aware state, simulation pipeline, Unity synchronization, guardrails.
            </div>
            <a className="mt-3 inline-block text-sm text-primary underline" href="/app/console">
              Go to /app/console
            </a>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-sm font-medium">Data Viewer</div>
            <div className="mt-1 text-sm text-muted">
              Browse datasets without the “operate instrument” frame.
            </div>
            <a className="mt-3 inline-block text-sm text-primary underline" href="/app/data">
              Go to /app/data
            </a>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}