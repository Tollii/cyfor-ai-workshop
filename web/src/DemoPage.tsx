import { usePostDemoReset, usePostDemoSeed, type DemoResult } from "./api";

function Result({ result, action }: { result: DemoResult; action: "seed" | "reset" }) {
  return (
    <p className="text-sm" style={{ color: "#166534" }}>
      {action === "seed"
        ? `Lastet inn ${result.items} ressurser og ${result.reservations} reservasjoner.`
        : `Slettet ${result.items} ressurser og ${result.reservations} reservasjoner.`}
    </p>
  );
}

export default function DemoPage() {
  const seedMutation = usePostDemoSeed();
  const resetMutation = usePostDemoReset();

  const lastAction = seedMutation.isSuccess && (!resetMutation.data || seedMutation.submittedAt >= resetMutation.submittedAt)
    ? ({ action: "seed", result: seedMutation.data } as const)
    : resetMutation.isSuccess
      ? ({ action: "reset", result: resetMutation.data } as const)
      : null;

  const error = seedMutation.error ?? resetMutation.error;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f5f2ed", color: "#1c2212" }}>
      <header style={{ backgroundColor: "#1c2212" }}>
        <div className="mx-auto max-w-4xl flex items-center gap-4 px-6 py-4">
          <img src="/forsvaret-logo-hvit.png" alt="Forsvaret" className="h-10 w-auto" />
        </div>
      </header>

      <div style={{ backgroundColor: "#4a5c38" }} className="px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold tracking-wide" style={{ color: "#f5f2ed" }}>
            Demo og testdata
          </h1>
          <p className="mt-1 text-sm font-light" style={{ color: "#c8b99a" }}>
            Tøm databasen eller fyll den med varierte eksempeldata.
          </p>
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 space-y-6">
        <section className="rounded-none border-l-4 p-5 shadow-sm space-y-4" style={{ backgroundColor: "#ffffff", borderColor: "#4a5c38" }}>
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#4a5c38" }}>
            Handlinger
          </h2>
          <p className="text-sm font-light" style={{ color: "#4a5c38" }}>
            «Fyll med eksempeldata» tømmer databasen først og legger deretter inn ressurser av
            ulike typer, med reservasjoner som dekker ventende, bekreftede og kansellerte
            statuser i fortid, nåtid og fremtid.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending || resetMutation.isPending}
              className="rounded-none px-6 py-2 text-sm font-bold uppercase tracking-wider transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: "#4a5c38", color: "#f5f2ed" }}
            >
              {seedMutation.isPending ? "Fyller..." : "Fyll med eksempeldata"}
            </button>
            <button
              type="button"
              onClick={() => resetMutation.mutate()}
              disabled={seedMutation.isPending || resetMutation.isPending}
              className="rounded-none border px-6 py-2 text-sm font-bold uppercase tracking-wider transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderColor: "#c8b99a", color: "#1c2212" }}
            >
              {resetMutation.isPending ? "Tømmer..." : "Tøm databasen"}
            </button>
          </div>

          {lastAction ? <Result result={lastAction.result} action={lastAction.action} /> : null}
          {error ? (
            <p className="text-sm" style={{ color: "#b91c1c" }}>
              Noe gikk galt: {error.message}
            </p>
          ) : null}
        </section>

        <a href="/" className="inline-block text-sm font-medium" style={{ color: "#4a5c38" }}>
          ← Tilbake til ressurser
        </a>
      </main>

      <footer className="px-6 py-4 text-xs font-light text-center" style={{ backgroundColor: "#1c2212", color: "#c8b99a" }}>
        Forsvaret – Ressursadministrasjon
      </footer>
    </div>
  );
}
