import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Badge, Card, Container, PageHeader } from "@/components/ui";
import { Logo } from "@/components/ui/Logo";
import { prisma } from "@/lib/prisma";
import { DATASETS } from "@/lib/datasets";

/**
 * Rendered per request rather than at build time. The counts below come from the
 * database, and a statically prerendered attribution page would keep claiming
 * whatever was true when the project was built.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Attributions",
  description:
    "The open datasets NextStep's question bank draws on, their licences and their authors.",
};

/**
 * Credit where the questions come from.
 *
 * Public on purpose: both open licences we use require attribution, and an
 * attribution page behind a login is not attribution. It is also generated from
 * the database rather than written by hand — it lists the sources that actually
 * have approved questions, with the counts, so it cannot drift into crediting a
 * dataset we no longer use or quietly omit one we do.
 */
export default async function AttributionsPage() {
  // Grouped by source, approved only: this page describes the content being
  // served, not everything sitting in the review queue.
  const bySource = await prisma.question.groupBy({
    by: ["source"],
    where: { status: "APPROVED" },
    _count: { _all: true },
  });

  const counts = new Map(bySource.map((row) => [row.source, row._count._all]));
  const used = Object.values(DATASETS)
    .filter((dataset) => (counts.get(dataset.key) ?? 0) > 0)
    .sort((a, b) => (counts.get(b.key) ?? 0) - (counts.get(a.key) ?? 0));

  // A source in the database with no registry entry means someone imported
  // something without declaring it. Saying so is better than hiding it.
  const undeclared = bySource
    .filter((row) => !DATASETS[row.source] && row._count._all > 0)
    .map((row) => row.source);

  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);

  return (
    <main className="flex min-h-screen flex-col py-10">
      <Container className="max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/">
            <Logo />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-subtle transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        <div className="mt-8">
          <PageHeader
            title="Attributions"
            description={`Where NextStep's questions come from. ${total} approved ${total === 1 ? "question" : "questions"} are currently served from the sources below.`}
          />
        </div>

        {used.length === 0 ? (
          <p className="mt-8 rounded-card border border-line border-dashed bg-surface px-5 py-6 text-sm leading-relaxed text-ink-muted">
            No approved questions are being served yet, so there is nothing to
            attribute. This page fills in as content is approved.
          </p>
        ) : (
          <div className="mt-8 space-y-5">
            {used.map((dataset) => {
              const count = counts.get(dataset.key) ?? 0;
              return (
                <Card key={dataset.key} className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="text-base font-semibold">{dataset.name}</h2>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone="accent">
                        {count} {count === 1 ? "question" : "questions"}
                      </Badge>
                      <Badge tone="neutral">{dataset.licence}</Badge>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {dataset.description}
                  </p>

                  <dl className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
                    <div>
                      <dt className="text-xs font-semibold tracking-wider text-ink-subtle uppercase">
                        Authors
                      </dt>
                      <dd className="mt-1 text-ink-muted">{dataset.authors}</dd>
                    </div>

                    <div>
                      <dt className="text-xs font-semibold tracking-wider text-ink-subtle uppercase">
                        Licence
                      </dt>
                      <dd className="mt-1 text-ink-muted">
                        {dataset.licenceUrl ? (
                          <a
                            href={dataset.licenceUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                          >
                            {dataset.licence}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          dataset.licence
                        )}
                        {" — "}
                        {dataset.obligations}
                      </dd>
                    </div>

                    {dataset.licenceUrl && (
                      <div>
                        <dt className="text-xs font-semibold tracking-wider text-ink-subtle uppercase">
                          Source
                        </dt>
                        <dd className="mt-1">
                          <a
                            href={dataset.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 font-medium break-all text-accent hover:underline"
                          >
                            {dataset.url}
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        </dd>
                      </div>
                    )}

                    <div>
                      <dt className="text-xs font-semibold tracking-wider text-ink-subtle uppercase">
                        Changes we made
                      </dt>
                      <dd className="mt-1 text-ink-muted">
                        {dataset.key === "curated"
                          ? "Written for NextStep."
                          : "Questions were imported as drafts, edited for wording and clarity, filed under a topic, and published only after a human confirmed the answer and the method. Option labels were stripped and the dataset's rationale became the explanation shown to students."}
                      </dd>
                    </div>
                  </dl>
                </Card>
              );
            })}
          </div>
        )}

        {undeclared.length > 0 && (
          <p className="mt-6 rounded-card border border-warn-line bg-warn-soft px-5 py-4 text-sm leading-relaxed text-ink-muted">
            <span className="font-semibold text-warn">Undeclared source.</span>{" "}
            Questions are being served from{" "}
            <span className="font-mono">{undeclared.join(", ")}</span>, which has no
            entry in the dataset registry. Whoever imported it needs to add one to{" "}
            <span className="font-mono">src/lib/datasets.ts</span> so it can be
            credited properly.
          </p>
        )}

        <p className="mt-8 text-xs leading-relaxed text-ink-subtle">
          NextStep is a student project at Terna Engineering College and not an
          official college service. If you believe content here is used outside
          its licence, tell us and it will be removed.
        </p>
      </Container>
    </main>
  );
}
